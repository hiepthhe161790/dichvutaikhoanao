import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/api-auth';
import Product from '@/lib/models/Product';
import Account from '@/lib/models/Account';
import ServicePricing from '@/lib/models/ServicePricing';
import ServiceOrder from '@/lib/models/ServiceOrder';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import mongoose from 'mongoose';
import { apiEngine } from '@/lib/integrations/engine';
import ProductProviderMapping from '@/lib/models/ProductProviderMapping';
import ExternalOrderLog from '@/lib/models/ExternalOrderLog';
import Provider from '@/lib/models/Provider';
import type { IProviderConfig } from '@/lib/integrations/types';
import { checkAndAlertLowBalance } from '@/lib/integrations/balance-checker';
import { acquireLock, releaseLock } from '@/lib/lock';

export async function POST(request: NextRequest) {
  let userLockKey = '';
  let lockAcquired = false;

  try {
    const auth = await authenticateApiKey(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { user } = auth;
    const userId = user._id.toString();

    const body = await request.json();
    const { itemId, type, quantity = 1, links, note } = body;

    if (!itemId || !type || quantity < 1) {
      return NextResponse.json({ success: false, error: 'Missing required fields or invalid quantity' }, { status: 400 });
    }

    // Lấy khóa khóa phân tán cho người dùng để tránh nạp mua trùng qua API
    userLockKey = `lock:user:${userId}`;
    const userLockAcquired = await acquireLock(userLockKey, 5, 200);
    if (!userLockAcquired) {
      return NextResponse.json({ success: false, error: 'Your request is being processed. Please do not submit multiple requests.' }, { status: 409 });
    }
    lockAcquired = true;

    if (type === 'account') {
      return await buyAccount(itemId, quantity, userId);
    } else if (type === 'service') {
      return await buyService(itemId, quantity, links, note, userId);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid type. Must be account or service' }, { status: 400 });
    }

  } catch (error) {
    console.error('API v1 /orders/buy error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (lockAcquired) {
      await releaseLock(userLockKey);
    }
  }
}

async function buyAccount(productId: string, quantity: number, userId: string) {
  let productLockKey = `lock:product:${productId}`;
  let lockAcquired = false;

  try {
    const productLockAcquired = await acquireLock(productLockKey, 15, 100);
    if (!productLockAcquired) {
      return NextResponse.json({ success: false, error: 'Hệ thống đang bận xử lý giao dịch sản phẩm này, vui lòng thử lại sau giây lát.' }, { status: 409 });
    }
    lockAcquired = true;

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

    const totalPrice = product.price * quantity;

    // Quick check balance
    const user = await User.findById(userId);
    if (!user || user.balance < totalPrice) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
    }

    // 1. Internal Inventory
    const potentialAccounts = await Account.find({ product: productId, status: 'available' }).limit(quantity);
    
    if (potentialAccounts.length >= quantity) {
      const potentialIds = potentialAccounts.map(acc => acc._id);

      const lockResult = await Account.updateMany(
        { _id: { $in: potentialIds }, status: 'available' },
        { $set: { status: 'locked_temp', lockedBy: userId, lockedAt: new Date() } }
      );

      if (lockResult.modifiedCount >= quantity) {
        // Lock success -> Deduct balance
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId, balance: { $gte: totalPrice } },
          { $inc: { balance: -totalPrice, totalPurchased: quantity, totalSpent: totalPrice } },
          { new: true }
        );

        if (!updatedUser) {
          // Rollback
          await Account.updateMany(
            { _id: { $in: potentialIds }, status: 'locked_temp', lockedBy: userId },
            { $set: { status: 'available' }, $unset: { lockedBy: '', lockedAt: '' } }
          );
          return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
        }

        const accountsData = potentialAccounts.map(acc => ({
          username: acc.username,
          password: acc.password,
          email: acc.email,
          emailPassword: acc.emailPassword,
          phone: acc.phone,
          raw: acc.raw,
        }));

        const order = await new Order({
          userId: new mongoose.Types.ObjectId(userId),
          productId: new mongoose.Types.ObjectId(productId),
          accountId: potentialIds[0],
          quantity,
          totalPrice,
          status: 'completed',
          paymentMethod: 'wallet',
          paymentStatus: 'paid',
          accounts: accountsData,
          source: 'internal',
          notes: `API Purchase (Internal)`,
        }).save();

        await Account.updateMany(
          { _id: { $in: potentialIds } },
          { $set: { status: 'sold', soldAt: new Date(), soldTo: new mongoose.Types.ObjectId(userId) }, $unset: { lockedBy: '', lockedAt: '' } }
        );

        const newAvailableCount = await Account.countDocuments({ productId, status: 'available' });
        await Product.findByIdAndUpdate(productId, {
          availableCount: newAvailableCount,
          status: newAvailableCount > 0 ? 'available' : 'soldout',
        });

        return NextResponse.json({
          success: true,
          message: `Successfully purchased ${quantity} accounts`,
          data: { orderId: order._id, quantity, totalPrice, accounts: accountsData, status: 'completed' },
        });
      }

      // Rollback any lock
      if (lockResult.modifiedCount > 0) {
        await Account.updateMany(
          { _id: { $in: potentialIds }, status: 'locked_temp', lockedBy: userId },
          { $set: { status: 'available' }, $unset: { lockedBy: '', lockedAt: '' } }
        );
      }
    }

    // 2. External Provider (Fallback chain)
    const mappings = await ProductProviderMapping.find({
      localProductId: productId,
      isActive: true,
    })
      .populate('providerId')
      .sort({ priority: 1 });

    for (const mapping of mappings) {
      const provider = mapping.providerId as any;
      if (!provider || provider.status !== 'active' || !provider.isHealthy) continue;

      const startTime = Date.now();

      // Deduct balance first
      const reservedUser = await User.findOneAndUpdate(
        { _id: userId, balance: { $gte: totalPrice } },
        { $inc: { balance: -totalPrice } },
        { new: true }
      );

      if (!reservedUser) {
        return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
      }

      const log = await ExternalOrderLog.create({
        providerId: provider._id,
        mappingId: mapping._id,
        externalProductId: mapping.externalProductId,
        quantity,
        status: 'pending',
        rawRequest: {
          externalProductId: mapping.externalProductId,
          quantity,
        },
        durationMs: 0,
      });

      try {
        const result = await apiEngine.buyProduct(
          provider as unknown as IProviderConfig,
          mapping.externalProductId,
          quantity
        );

        const durationMs = Date.now() - startTime;

        if (!result.success || result.accounts.length === 0) {
          // Refund
          await User.findByIdAndUpdate(userId, { $inc: { balance: totalPrice } });

          await ExternalOrderLog.findByIdAndUpdate(log._id, {
            status: 'failed',
            errorMessage: result.error || 'API returned no accounts',
            durationMs,
          });
          continue; // try next
        }

        // Success
        await User.findByIdAndUpdate(userId, {
          $inc: { totalPurchased: quantity, totalSpent: totalPrice }
        });

        checkAndAlertLowBalance(provider._id.toString());

        const accountsData = result.accounts.map(acc => ({
          username: acc.username,
          password: acc.password,
          email: acc.email,
          emailPassword: acc.emailPassword,
          phone: acc.phone,
          raw: acc._raw,
        }));

        const order = await new Order({
          userId: new mongoose.Types.ObjectId(userId),
          productId: new mongoose.Types.ObjectId(productId),
          accountId: new mongoose.Types.ObjectId(),
          quantity,
          totalPrice,
          status: 'completed',
          paymentMethod: 'wallet',
          paymentStatus: 'paid',
          accounts: accountsData,
          source: 'external',
          externalLogId: log._id,
          notes: `API Purchase (External)`,
        }).save();

        await ExternalOrderLog.findByIdAndUpdate(log._id, { 
          localOrderId: order._id, 
          status: 'success', 
          externalOrderId: result.transId, 
          parsedAccounts: accountsData, 
          durationMs 
        });

        return NextResponse.json({
          success: true,
          message: `Successfully purchased ${quantity} accounts`,
          data: { orderId: order._id, quantity, totalPrice, accounts: accountsData, status: 'completed' },
        });

      } catch (err: any) {
        // Rollback balance if unexpected error occurs
        await User.findByIdAndUpdate(userId, { $inc: { balance: totalPrice } });

        await ExternalOrderLog.findByIdAndUpdate(log._id, { 
          status: 'failed', 
          errorMessage: err.message 
        });
        continue;
      }
    }

    return NextResponse.json({ success: false, error: 'Out of stock' }, { status: 400 });
  } finally {
    if (lockAcquired) {
      await releaseLock(productLockKey);
    }
  }
}

async function buyService(serviceId: string, quantity: number, links: any[], note: string, userId: string) {
  if (!links || links.length === 0) {
    return NextResponse.json({ success: false, error: 'Links array is required for services' }, { status: 400 });
  }

  const serviceConfig = await ServicePricing.findOne({ _id: serviceId, isActive: true });
  if (!serviceConfig) return NextResponse.json({ success: false, error: 'Service not found or inactive' }, { status: 404 });

  // Assume the user wants the first active server and standard quality for API simplicity
  // Unless we want to expose full complex params, we default to the first server.
  const serverConfig = serviceConfig.servers.find((s: any) => s.isActive);
  if (!serverConfig) return NextResponse.json({ success: false, error: 'No active server for this service' }, { status: 400 });

  const basePrice = serviceConfig.basePrice;
  const serverMultiplier = serverConfig.priceMultiplier;
  const totalPrice = links.reduce((sum: number, link: any) => {
    const qty = parseInt(link.quantity) || 0;
    return sum + (qty * basePrice * serverMultiplier);
  }, 0);

  // Check balance and deduct
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, balance: { $gte: totalPrice } },
    { $inc: { balance: -totalPrice, totalSpent: totalPrice } },
    { new: true }
  );

  if (!updatedUser) {
    return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
  }

  const serviceOrder = await new ServiceOrder({
    userId: new mongoose.Types.ObjectId(userId),
    serviceType: serviceConfig.serviceType || 'buff',
    platform: serviceConfig.platform,
    server: serverConfig.id,
    serverId: serverConfig.id,
    serverName: serverConfig.name,
    priceMultiplier: serverMultiplier,
    productLinks: links,
    note: note || 'API Purchase',
    totalPrice,
    basePrice,
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'wallet'
  }).save();

  return NextResponse.json({
    success: true,
    message: 'Service order created',
    data: { orderId: serviceOrder._id, totalPrice, status: 'pending' },
  });
}
