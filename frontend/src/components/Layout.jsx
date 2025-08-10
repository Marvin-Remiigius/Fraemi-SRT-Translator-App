import React from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';

const Layout = () => {
  return (
    <>
      <AppHeader />
      <main>
        <Outlet /> {/* Child routes will render here */}
      </main>
    </>
  );
};

export default Layout;