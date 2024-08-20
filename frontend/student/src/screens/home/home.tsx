import { useEffect, useState } from 'react';
import { SearchNormal1 } from 'iconsax-react';
import EventCard from '../../components/EventCard';
import FooterNav from '../../components/FooterNav';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import TrendingCard from '../../components/TrendingCard';

import { useUserData } from '../../hooks/useUserData';
import Loader from '../../components/Loader';
import { axiosCall } from '../../utils/api';

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosCall('POST', '/event/p/get', true);
        console.log(response);
        if (response.events) {
          setUpcomingEvents(response.events.UPCOMING);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

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
          <div className="overflow-x-auto flex gap-4 ">
            {upcomingEvents.map((event) => (
              <TrendingCard key={event.id} event={event} />
            ))}
            {/* TODO: Add more trending events here if needed */}
          </div>
        </div>
        <div className="flex flex-col gap-4 z-10">
          <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
            Upcoming Events
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto mb-12">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
      <FooterNav />
    </div>
  );
}
