import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import { UserDataContext } from '../contexts/userContext';
import { useContext } from 'react';

export default function HeaderLayout() {
  const { userData } = useContext(UserDataContext);

  return (
    <div className="min-h-screen p-4  mb-16">
      <Header name={userData?.name} photo_url={userData?.photo_url} />
      <Outlet />
    </div>
  );
}
