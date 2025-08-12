import React from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';

const Layout = () => {
  return (
    <>
      <AppHeader />
      <main>
        <Outlet /> 
      </main>
    </>
  );
};

export default Layout;