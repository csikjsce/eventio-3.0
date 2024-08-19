import { SearchNormal1 } from 'iconsax-react';
import EventCard from '../../components/EventCard';
import FooterNav from '../../components/FooterNav';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import TrendingCard from '../../components/TrendingCard';

import abhi from '../../assets/abhi.jpeg';
import man1 from '../../assets/man1.jpeg';
import { useUserData } from '../../hooks/useUserData';
import { useEffect, useState } from 'react';
import Loader from '../../components/Loader';

const event: {
  name: string;
  council: string;
  image: string;
  councilImage: string;
  date: Date;
  location: string;
  tags: string[];
  shortDesc: string;
  status: string;
} = {
  name: 'Road To Programming',
  council: 'CSI KJSCE',
  image: abhi,
  councilImage: man1,
  date: new Date(1724758200000),
  location: 'KJSCE Auditorium',
  tags: ['Tech', 'Registered'],
  shortDesc: 'Short Description',
  status: 'Live',
};

export default function Home() {
  const user = useUserData();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user.userContext.userData) {
      setLoading(false);
    }
  }, [user.userContext.userData]);
  return (
    <>
      {loading && <Loader />}
      <div className="flex flex-col p-4">
        <div className="flex flex-col gap-8">
          {/* main area */}
          <Header
            name={user.userContext.userData?.name}
            photo_url={user.userContext.userData?.photo_url}
          />
          <SearchBar
            Icon={SearchNormal1}
            text="What event are you looking for..."
          />
          <div className="flex flex-col gap-4 z-10">
            <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
              Trending Events
            </p>
            <div className="overflow-x-auto">
              <TrendingCard event={event} />
              {/* TODO: horizontal scrolling */}
            </div>
          </div>
          <div className="flex flex-col gap-4 z-10">
            <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
              Upcoming Events
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto mb-12">
              <EventCard event={event} />
              <EventCard event={event} />
              <EventCard event={event} />
              <EventCard event={event} />
              <EventCard event={event} />
            </div>
          </div>
        </div>

        <FooterNav />
      </div>
    </>
  );
}
