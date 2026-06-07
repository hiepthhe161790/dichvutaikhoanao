/**
 * Parser Registry
 * 
 * Đăng ký tất cả parsers theo format key.
 * Thêm format mới: tạo file parser mới → đăng ký tại đây.
 */
import type { ResponseParser, ItemFormat } from '../types';
import { pipeParser } from './pipe-parser';
import { jsonParser } from './json-parser';
import { colonParser } from './colon-parser';

const parserRegistry: Record<ItemFormat, ResponseParser> = {
  pipe_separated: pipeParser,
  json_object: jsonParser,
  colon_separated: colonParser,
  newline: {
    // Newline: mỗi dòng là 1 giá trị (thường là chỉ username hoặc chỉ password)
    parse(items: unknown[], fields: string[]): ReturnType<ResponseParser['parse']> {
      if (fields.length >= 2) {
        // Nếu có nhiều field, treat như pipe với separator là newline
        return pipeParser.parse(items, fields);
      }
      return items
        .filter((i) => typeof i === 'string' && i.trim())
        .map((i) => ({ username: String(i).trim(), password: '' }));
    },
  },
};

/**
 * Lấy parser theo format.
 * @throws Error nếu format không được hỗ trợ
 */
export function getParser(format: ItemFormat): ResponseParser {
  const parser = parserRegistry[format];
  if (!parser) {
    throw new Error(`Unsupported item format: "${format}". Supported: ${Object.keys(parserRegistry).join(', ')}`);
  }
  return parser;
}

/** Danh sách formats được hỗ trợ */
export const SUPPORTED_FORMATS: ItemFormat[] = Object.keys(parserRegistry) as ItemFormat[];
