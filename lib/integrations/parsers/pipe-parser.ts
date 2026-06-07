/**
 * Pipe-Separated Parser
 * 
 * Xử lý format: "username|password|email"
 * Ví dụ taikhoan295: "1000040304952|GUTJXYIFPWLHCNDOMBRKVAQESZ"
 */
import type { ResponseParser, ParsedAccount } from '../types';

export const pipeParser: ResponseParser = {
  parse(items: unknown[], fields: string[]): ParsedAccount[] {
    const results: ParsedAccount[] = [];

    for (const item of items) {
      if (typeof item !== 'string') continue;

      const parts = item.split('|');
      const account: ParsedAccount = {
        username: '',
        password: '',
      };

      fields.forEach((field, index) => {
        if (parts[index] !== undefined) {
          account[field] = parts[index].trim();
        }
      });

      // Đảm bảo có username và password
      if (account.username || account.password) {
        results.push(account);
      }
    }

    return results;
  },
};
