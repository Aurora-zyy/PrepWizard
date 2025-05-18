import React, { ReactNode } from 'react';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='auth-layout'>{children}</div>
    //here the class "auth-layout" is basiclaly vertically and horizontally centered
    // and justified in global.css
  );
};

export default AuthLayout;
