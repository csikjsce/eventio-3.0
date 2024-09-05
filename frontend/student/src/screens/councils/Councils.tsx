import { SearchNormal1 } from 'iconsax-react';
import CouncilCard from '../../components/CouncilCard';
import SearchBar from '../../components/SearchBar';

import csiLogo from '../../assets/csiLogo.png';

export default function Councils() {
  return (
    <div className="flex flex-col gap-8">
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
  );
}
