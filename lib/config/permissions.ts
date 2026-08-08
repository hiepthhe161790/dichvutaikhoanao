export type Role = 'customer' | 'admin' | 'seller' | 'staff';

export interface RolePolicy {
  allowedPages: string[]; // Tab names allowed in the admin dashboard (e.g. 'dashboard', 'service-orders'). Use ['*'] for all.
  allowedApiPrefixes: string[]; // Allowed admin API prefixes.
  actions: {
    deleteServiceOrder: boolean;
    refundServiceOrder: boolean;
    deleteAccount: boolean;
  };
}

export const ROLE_POLICIES: Record<Role, RolePolicy> = {
  admin: {
    allowedPages: ['*'],
    allowedApiPrefixes: ['/api/admin/'],
    actions: {
      deleteServiceOrder: true,
      refundServiceOrder: true,
      deleteAccount: true
    }
  },
  staff: {
    // Staff is allowed to access Dashboard, Service Orders, and Accounts
    allowedPages: ['dashboard', 'service-orders', 'accounts'],
    allowedApiPrefixes: [
      '/api/admin/service-orders',
      '/api/admin/accounts'
    ],
    actions: {
      deleteServiceOrder: false,  // Blocked
      refundServiceOrder: false,  // Blocked
      deleteAccount: false        // Blocked from deleting account stocks
    }
  },
  customer: {
    allowedPages: [],
    allowedApiPrefixes: [],
    actions: {
      deleteServiceOrder: false,
      refundServiceOrder: false,
      deleteAccount: false
    }
  },
  seller: {
    allowedPages: [],
    allowedApiPrefixes: [],
    actions: {
      deleteServiceOrder: false,
      refundServiceOrder: false,
      deleteAccount: false
    }
  }
};

export function hasPageAccess(role: Role | undefined, page: string): boolean {
  if (!role) return false;
  const policy = ROLE_POLICIES[role];
  if (!policy) return false;
  if (policy.allowedPages.includes('*')) return true;
  return policy.allowedPages.includes(page);
}

export function hasApiAccess(role: Role | undefined, pathname: string): boolean {
  if (!role) return false;
  if (role === 'admin') return true;
  const policy = ROLE_POLICIES[role];
  if (!policy) return false;
  return policy.allowedApiPrefixes.some(prefix => pathname.startsWith(prefix));
}
