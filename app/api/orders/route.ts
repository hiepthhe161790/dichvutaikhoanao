import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import Account from '@/lib/models/Account';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import ProductProviderMapping from '@/lib/models/ProductProviderMapping';
import ExternalOrderLog from '@/lib/models/ExternalOrderLog';
import Provider from '@/lib/models/Provider';
import { getTokenFromCookies } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import { apiEngine } from '@/lib/integrations/engine';
import type { IProviderConfig } from '@/lib/integrations/types';
import { checkAndAlertLowBalance } from '@/lib/integrations/balance-checker';
import mongoose from 'mongoose';
import { logAction } from '@/lib/utils/logger';
import { sendTelegramAlert } from '@/lib/notifications/telegram';
import { encrypt, decrypt } from '@/lib/encryption';
import { acquireLock, releaseLock } from '@/lib/lock';



// GET /api/orders - Lấy danh sách đơn hàng của user
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Get user from token
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    const total = await Order.countDocuments(query);
    const ordersRaw = await Order.find(query)
      .populate('productId', 'title price platform')
      .populate('accountId')
      .populate('userId', '_id email username phone fullName balance totalSpent status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const orders = ordersRaw.map((order: any) => {
      if (order.account) {
        order.account.password = decrypt(order.account.password);
        if (order.account.emailPassword) {
          order.account.emailPassword = decrypt(order.account.emailPassword);
        }
      }
      if (order.accounts && order.accounts.length > 0) {
        order.accounts = order.accounts.map((acc: any) => ({
          ...acc,
          password: decrypt(acc.password),
          emailPassword: acc.emailPassword ? decrypt(acc.emailPassword) : undefined,
          raw: acc.raw ? decrypt(acc.raw) : undefined,
        }));
      }
      return order;
    });

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Tạo đơn hàng mới (mua hàng — Dual-Source)
export async function POST(request: NextRequest) {
  let userLockKey = '';
  let productLockKey = '';
  let locksAcquired = false;

  try {
    const conn = await connectDB();
    if (!conn) return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 });

    const token = getTokenFromCookies(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    const userId = decoded.userId;

    const body = await request.json();
    const { productId, quantity = 1, coupon } = body;

    if (!productId || quantity < 1) {
      return NextResponse.json({ success: false, error: 'Invalid productId or quantity' }, { status: 400 });
    }

    // Thiết lập key khóa phân tán
    userLockKey = `lock:user:${userId}`;
    productLockKey = `lock:product:${productId}`;

    // Lấy khóa người dùng (chống click đúp mua trùng)
    const userLockAcquired = await acquireLock(userLockKey, 5, 200); // Thử lại tối đa 5 lần, mỗi lần cách nhau 200ms
    if (!userLockAcquired) {
      return NextResponse.json({ success: false, error: 'Yêu cầu của bạn đang được xử lý, vui lòng không click liên tiếp.' }, { status: 409 });
    }

    // Lấy khóa sản phẩm (chống tranh chấp kho hàng khi đông khách)
    const productLockAcquired = await acquireLock(productLockKey, 15, 100); // Thử lại tối đa 15 lần, mỗi lần cách nhau 100ms
    if (!productLockAcquired) {
      await releaseLock(userLockKey);
      return NextResponse.json({ success: false, error: 'Hệ thống đang bận xử lý giao dịch sản phẩm này, vui lòng thử lại sau giây lát.' }, { status: 409 });
    }

    locksAcquired = true;

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

    const totalPrice = product.price * quantity;

    // Quick balance check (non-atomic — for UX rejection)
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    if (user.balance < totalPrice) {
      return NextResponse.json(
        { success: false, error: `Số dư không đủ. Cần thêm ${totalPrice - user.balance}đ` },
        { status: 400 }
      );
    }

    // ─── NGUỒN 1: Kho nội bộ ──────────────────────────────────────────────
    const potentialAccounts = await Account.find({ productId, status: 'available' }).limit(quantity);

    if (potentialAccounts.length >= quantity) {
      // Đủ hàng nội bộ — dùng optimistic locking như cũ
      const potentialIds = potentialAccounts.map(acc => acc._id);

      const lockResult = await Account.updateMany(
        { _id: { $in: potentialIds }, status: 'available' },
        { $set: { status: 'locked_temp', lockedBy: userId, lockedAt: new Date() } }
      );

      if (lockResult.modifiedCount >= quantity) {
        // Lock thành công — trừ ví
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId, balance: { $gte: totalPrice } },
          { $inc: { balance: -totalPrice, totalPurchased: quantity, totalSpent: totalPrice } },
          { new: true }
        );

        if (!updatedUser) {
          // Rollback locks
          await Account.updateMany(
            { _id: { $in: potentialIds }, status: 'locked_temp', lockedBy: userId },
            { $set: { status: 'available' }, $unset: { lockedBy: '', lockedAt: '' } }
          );
          return NextResponse.json({ success: false, error: 'Số dư không đủ.' }, { status: 400 });
        }

        const accountsData = potentialAccounts.map(acc => ({
          username: acc.username,
          password: acc.password,
          email: acc.email,
          emailPassword: acc.emailPassword,
          phone: acc.phone,
          additionalInfo: acc.additionalInfo,
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
          notes: `Mua ${quantity} tài khoản từ ${product.title}`,
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

        // Ghi audit log mua hàng kho nội bộ
        await logAction({
          action: 'purchase_internal',
          actor: userId,
          actorRole: 'customer',
          target: 'order',
          targetId: order._id.toString(),
          changes: [
            { field: 'totalPrice', oldValue: 0, newValue: totalPrice },
            { field: 'quantity', oldValue: 0, newValue: quantity },
            { field: 'source', oldValue: '', newValue: 'internal' }
          ],
          status: 'success'
        });

        const decryptedAccounts = accountsData.map(acc => ({
          ...acc,
          password: decrypt(acc.password),
          emailPassword: acc.emailPassword ? decrypt(acc.emailPassword) : undefined,
          raw: acc.raw ? decrypt(acc.raw) : undefined,
        }));

        return NextResponse.json({
          success: true,
          message: `Mua thành công ${quantity} tài khoản`,
          data: { orderId: order._id, quantity, totalPrice, accounts: decryptedAccounts, source: 'internal' },
        }, { status: 201 });
      }

      // Race condition — release bất kỳ lock nào đã lấy được
      if (lockResult.modifiedCount > 0) {
        await Account.updateMany(
          { _id: { $in: potentialIds }, status: 'locked_temp', lockedBy: userId },
          { $set: { status: 'available' }, $unset: { lockedBy: '', lockedAt: '' } }
        );
      }
    }

    // ─── NGUỒN 2: Provider ngoài (Fallback chain theo priority) ──────────
    const mappings = await ProductProviderMapping.find({
      localProductId: productId,
      isActive: true,
    })
      .populate('providerId')
      .sort({ priority: 1 }); // priority thấp = thử trước

    for (const mapping of mappings) {
      const provider = mapping.providerId as any;
      if (!provider || provider.status !== 'active' || !provider.isHealthy) continue;

      const startTime = Date.now();

      // 1. Tạm giữ số dư ví của user trước khi gọi API (tránh race condition và double spending)
      const reservedUser = await User.findOneAndUpdate(
        { _id: userId, balance: { $gte: totalPrice } },
        { $inc: { balance: -totalPrice } },
        { new: true }
      );

      if (!reservedUser) {
        return NextResponse.json({ success: false, error: 'Số dư không đủ.' }, { status: 400 });
      }

      // Tạo log trước với status pending
      const log = await ExternalOrderLog.create({
        providerId: provider._id,
        mappingId: mapping._id,
        externalProductId: mapping.externalProductId,
        quantity,
        status: 'pending',
        rawRequest: {
          externalProductId: mapping.externalProductId,
          quantity,
          coupon,
        },
        durationMs: 0,
      });

      try {
        console.log(`[EXTERNAL API] Đang gọi mua từ Provider: ${provider.name} (ID: ${provider._id}) cho sản phẩm: ${mapping.externalProductId}`);
        
        const result = await apiEngine.buyProduct(
          provider as unknown as IProviderConfig,
          mapping.externalProductId,
          quantity,
          coupon
        );

        const durationMs = Date.now() - startTime;
        console.log(`[EXTERNAL API] Kết quả từ ${provider.name}: ${result.success ? 'THÀNH CÔNG' : 'THẤT BẠI'} (Thời gian: ${durationMs}ms)`);
        console.log(`[EXTERNAL API] Chi tiết Response gốc:`, JSON.stringify(result.rawResponse, null, 2));
        
        if (!result.success) {
          console.log(`[EXTERNAL API] Thông báo lỗi:`, result.error);
        }

        if (!result.success || result.accounts.length === 0) {
          // Hoàn tiền lại ví cho user nếu mua không thành công
          await User.findByIdAndUpdate(userId, { $inc: { balance: totalPrice } });

          // Ghi log thất bại, thử provider kế tiếp
          await ExternalOrderLog.findByIdAndUpdate(log._id, {
            status: 'failed',
            errorMessage: result.error || 'API returned no accounts',
            rawResponse: result.rawResponse,
            durationMs,
          });
          await ProductProviderMapping.findByIdAndUpdate(mapping._id, {
            $inc: { totalFailed: 1 },
            lastError: result.error || 'API returned no accounts',
          });
          await Provider.findByIdAndUpdate(provider._id, { $inc: { totalOrdersPlaced: 1 } });

          // Bắn thông báo Telegram Alert về sự cố mua hàng ngoài bất đồng bộ
          (async () => {
            const telegramMessage = `<b>⚠️ Cảnh báo: Mua hàng ngoài thất bại</b>\n` +
              `• <b>Nhà cung cấp:</b> ${provider.name}\n` +
              `• <b>Mã sản phẩm ngoài:</b> <code>${mapping.externalProductId}</code>\n` +
              `• <b>Số lượng mua:</b> ${quantity}\n` +
              `• <b>User ID:</b> <code>${userId}</code>\n` +
              `• <b>Chi tiết lỗi:</b> <code>${result.error || 'No accounts returned'}</code>\n` +
              `<i>Hệ thống đã tự động hoàn trả số dư (${totalPrice.toLocaleString('vi-VN')} VNĐ) vào ví khách hàng.</i>`;
            await sendTelegramAlert(telegramMessage);
          })();

          continue; // Thử provider tiếp theo
        }

        // ✅ Mua thành công từ provider ngoài — Cập nhật thống kê chi tiêu của user
        await User.findByIdAndUpdate(userId, {
          $inc: { totalPurchased: quantity, totalSpent: totalPrice }
        });

        // Gọi kiểm tra số dư ngầm ở background
        checkAndAlertLowBalance(provider._id.toString());

        const decryptedAccounts = result.accounts.map(acc => ({
          username: acc.username,
          password: acc.password,
          email: acc.email,
          emailPassword: acc.emailPassword,
          phone: acc.phone,
          raw: acc._raw,
        }));

        const encryptedAccounts = result.accounts.map(acc => ({
          username: acc.username,
          password: encrypt(acc.password),
          email: acc.email,
          emailPassword: acc.emailPassword ? encrypt(acc.emailPassword) : undefined,
          phone: acc.phone,
          raw: acc._raw ? encrypt(acc._raw) : undefined,
        }));

        const order = await new Order({
          userId: new mongoose.Types.ObjectId(userId),
          productId: new mongoose.Types.ObjectId(productId),
          accountId: new mongoose.Types.ObjectId(), // placeholder vì hàng ngoài không có Account doc
          quantity,
          totalPrice,
          status: 'completed',
          paymentMethod: 'wallet',
          paymentStatus: 'paid',
          accounts: encryptedAccounts,
          source: 'external',
          externalLogId: log._id,
          notes: `Mua ${quantity} tài khoản từ ${provider.name} (${mapping.externalProductId})`,
        }).save();

        // Cập nhật log với kết quả thành công
        await ExternalOrderLog.findByIdAndUpdate(log._id, {
          localOrderId: order._id,
          status: 'success',
          externalOrderId: result.transId,
          parsedAccounts: encryptedAccounts,
          rawResponse: result.rawResponse,
          durationMs,
        });

        // Cập nhật stats
        await ProductProviderMapping.findByIdAndUpdate(mapping._id, {
          $inc: { totalPurchased: quantity },
          lastUsedAt: new Date(),
        });
        await Provider.findByIdAndUpdate(provider._id, {
          $inc: { totalOrdersPlaced: 1, totalSuccessOrders: 1 },
        });

        // Ghi audit log mua hàng đối tác ngoài
        await logAction({
          action: 'purchase_external',
          actor: userId,
          actorRole: 'customer',
          target: 'order',
          targetId: order._id.toString(),
          changes: [
            { field: 'totalPrice', oldValue: 0, newValue: totalPrice },
            { field: 'quantity', oldValue: 0, newValue: quantity },
            { field: 'provider', oldValue: '', newValue: provider.name }
          ],
          status: 'success'
        });

        return NextResponse.json({
          success: true,
          message: `Mua thành công ${quantity} tài khoản từ ${provider.name}`,
          data: { orderId: order._id, quantity, totalPrice, accounts: decryptedAccounts, source: 'external' },
        }, { status: 201 });


      } catch (err: any) {
        // Lỗi không mong muốn từ provider — hoàn tiền cho user, log và thử tiếp
        await User.findByIdAndUpdate(userId, { $inc: { balance: totalPrice } });

        await ExternalOrderLog.findByIdAndUpdate(log._id, {
          status: 'failed',
          errorMessage: err.message,
          durationMs: Date.now() - startTime,
        });
        continue;
      }
    }

    // Tất cả nguồn đều thất bại
    const internalCount = potentialAccounts.length;
    const hasExternalMappings = mappings.length > 0;

    let errorMsg = 'Sản phẩm đã hết hàng.';
    if (internalCount > 0 && internalCount < quantity) {
      errorMsg = `Kho nội bộ chỉ còn ${internalCount} tài khoản (cần ${quantity}).`;
    } else if (hasExternalMappings) {
      errorMsg = 'Hết hàng. Tất cả nhà cung cấp ngoài đều thất bại, vui lòng thử lại sau.';
    }

    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  } finally {
    if (locksAcquired) {
      await releaseLock(productLockKey);
      await releaseLock(userLockKey);
    }
  }
}

