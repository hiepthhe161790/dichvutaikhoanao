import React, { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Đang tải...</div>}>
      <LoginClient />
    </Suspense>
  );
}
