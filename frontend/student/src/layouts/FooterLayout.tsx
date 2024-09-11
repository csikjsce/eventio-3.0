import FooterNav from '../components/FooterNav';
// import { useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export default function FooterLayout() {
  return (
    <>
      <Outlet />
      <FooterNav />
    </>
  );
}
