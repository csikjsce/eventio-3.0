import { SearchNormal1 } from 'iconsax-react';
import CouncilCard from '../../components/CouncilCard';
import FooterNav from '../../components/FooterNav';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';

export default function Councils() {
  return (
    <div className="flex flex-col p-4">
      <div className="flex flex-col gap-8">
        {/* main area */}
        <Header />
        <SearchBar
          Icon={SearchNormal1}
          text="What event are you looking for..."
        />

        <div className="flex flex-col gap-4 z-10">
          <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
            Councils
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto mb-12">
            <CouncilCard
              council={{
                name: 'CSI KJSCE',
                phoneNumber: '+91 8879773599',
                image: 'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
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
