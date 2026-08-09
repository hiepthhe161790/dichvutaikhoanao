import mongoose from 'mongoose';

const LockSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 60 } // Tự động xóa khóa sau 60 giây để tránh nghẽn chết (deadlock)
});

const Lock = mongoose.models.Lock || mongoose.model('Lock', LockSchema);

/**
 * Lấy khóa khóa phân tán (Distributed Lock).
 * @param key Mã khóa duy nhất
 * @param retryCount Số lần thử lại trước khi bỏ cuộc
 * @param delayMs Thời gian chờ (mili-giây) giữa các lần thử lại
 * @returns true nếu lấy khóa thành công, false nếu khóa đang bận
 */
export async function acquireLock(key: string, retryCount = 10, delayMs = 150): Promise<boolean> {
  for (let i = 0; i < retryCount; i++) {
    try {
      await Lock.create({ key });
      return true;
    } catch (err: any) {
      if (err.code === 11000) {
        // Khóa đang bị giữ bởi tiến trình khác, ngủ và thử lại sau
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
  return false;
}

/**
 * Giải phóng khóa khóa phân tán.
 * @param key Mã khóa duy nhất
 */
export async function releaseLock(key: string): Promise<void> {
  try {
    await Lock.deleteOne({ key });
  } catch (err) {
    console.error(`[Lock] Lỗi giải phóng khóa cho key ${key}:`, err);
  }
}
