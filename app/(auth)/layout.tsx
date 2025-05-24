import React, { ReactNode } from 'react';
import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const isAuth = await isAuthenticated();
  if (isAuth) {
    redirect('/');
  }
  return (
    <div className='auth-layout'>{children}</div>
    //here the class "auth-layout" is basiclaly vertically and horizontally centered
    // and justified in global.css
  );
};

export default AuthLayout;
