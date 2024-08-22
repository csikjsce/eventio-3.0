import { SearchNormal1 } from 'iconsax-react';
import CouncilCard from '../../components/CouncilCard';
import FooterNav from '../../components/FooterNav';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';

import { useEffect, useState } from 'react';
import { useUserData } from '../../hooks/useUserData';
import Loader from '../../components/Loader';

import csiLogo from '../../assets/csiLogo.png';

export default function Councils() {
  const [loading, setLoading] = useState(true);

  const user = useUserData();

  useEffect(() => {
    if (user.userContext.userData) {
      setLoading(false);
    }
  }, [user.userContext.userData]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col p-4 dark:bg-background-dark min-h-screen mb-8">
      <div className="flex flex-col gap-8">
        {/* main area */}
        {user.userContext.userData &&
          user.userContext.userData.name &&
          user.userContext.userData.photo_url && (
            <Header
              name={user.userContext.userData.name}
              photo_url={user.userContext.userData.photo_url}
            />
          )}
        <SearchBar Icon={SearchNormal1} className="mt-6" />

        <div className="flex flex-col gap-4 z-10">
          <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
            Councils
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto mb-12">
            <CouncilCard
              council={{
                name: 'CSI KJSCE',
                phoneNumber: '8657432101',
                image: csiLogo,
                tag: 'Tech',
              }}
            />
          </div>
        </div>
      </div>

      <FooterNav />
    </div>
  );
}
