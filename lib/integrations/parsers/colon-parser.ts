/**
 * Colon-Separated Parser
 * 
 * Xử lý format: "username:password" hoặc "user:pass:email"
 */
import type { ResponseParser, ParsedAccount } from '../types';

export const colonParser: ResponseParser = {
  parse(items: unknown[], fields: string[]): ParsedAccount[] {
    const results: ParsedAccount[] = [];

    for (const item of items) {
      if (typeof item !== 'string') continue;

      const parts = item.split(':');
      const account: ParsedAccount = {
        username: '',
        password: '',
      };

      fields.forEach((field, index) => {
        if (parts[index] !== undefined) {
          account[field] = parts[index].trim();
        }
      });

      if (account.username || account.password) {
        results.push(account);
      }
    }

    return results;
  },
};
