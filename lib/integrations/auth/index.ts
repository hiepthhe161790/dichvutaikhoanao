/**
 * Auth Builder Registry
 * 
 * Đăng ký tất cả auth builders.
 * Thêm auth method mới: tạo builder → đăng ký tại đây.
 */
import type { AuthBuilder, AuthType } from '../types';
import { queryParamAuth } from './query-param';
import { headerBearerAuth } from './header-bearer';
import { headerCustomAuth, basicAuth } from './header-custom';

const authRegistry: Record<AuthType, AuthBuilder> = {
  query_param: queryParamAuth,
  header_bearer: headerBearerAuth,
  header_custom: headerCustomAuth,
  basic: basicAuth,
};

/**
 * Lấy auth builder theo type.
 * @throws Error nếu type không được hỗ trợ
 */
export function getAuthBuilder(authType: AuthType): AuthBuilder {
  const builder = authRegistry[authType];
  if (!builder) {
    throw new Error(`Unsupported auth type: "${authType}". Supported: ${Object.keys(authRegistry).join(', ')}`);
  }
  return builder;
}

/** Danh sách auth types được hỗ trợ (để hiển thị trong UI) */
export const SUPPORTED_AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: 'query_param',    label: 'Query Param (?api_key=VALUE)' },
  { value: 'header_bearer',  label: 'Bearer Token (Authorization: Bearer)' },
  { value: 'header_custom',  label: 'Custom Header (X-API-Key: VALUE)' },
  { value: 'basic',          label: 'Basic Auth (user:password)' },
];
