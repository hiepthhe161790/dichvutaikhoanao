/**
 * JSON Object Parser
 * 
 * Xử lý format: { "username": "...", "password": "...", "email": "..." }
 * Dùng khi provider trả về mảng JSON objects
 */
import type { ResponseParser, ParsedAccount } from '../types';

export const jsonParser: ResponseParser = {
  parse(items: unknown[], fields: string[]): ParsedAccount[] {
    const results: ParsedAccount[] = [];

    for (const item of items) {
      if (typeof item !== 'object' || item === null) continue;

      const obj = item as Record<string, unknown>;
      const account: ParsedAccount = {
        username: '',
        password: '',
        _raw: JSON.stringify(item),
      };

      // Nếu fields được chỉ định, chỉ lấy các field đó theo thứ tự ưu tiên
      if (fields.length > 0) {
        fields.forEach((field) => {
          if (obj[field] !== undefined) {
            account[field] = String(obj[field]);
          }
        });
      } else {
        // Fallback: lấy tất cả các field string
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string' || typeof value === 'number') {
            account[key] = String(value);
          }
        }
      }

      if (account.username || account.password) {
        results.push(account);
      }
    }

    return results;
  },
};
