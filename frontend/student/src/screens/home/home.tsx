import { useEffect, useState } from 'react';
import EventCard from '../../components/EventCard';
import FooterNav from '../../components/FooterNav';
import Header from '../../components/Header';
// import { SearchNormal1 } from 'iconsax-react';
// import SearchBar from '../../components/SearchBar';
import TrendingCard from '../../components/TrendingCard';

import { useUserData } from '../../hooks/useUserData';
import Loader from '../../components/Loader';
import { axiosCall } from '../../utils/api';

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
  const [registrationOpen, setRegistrationOpen] = useState<EventData[]>([]);
  const [, setRegistrationClose] = useState<EventData[]>([]);
  const [ticketOpen, setTicketOpen] = useState<EventData[]>();
  const [, setTicketClose] = useState<EventData[]>();
  const [ongoingEvents, setOngoingEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingE, setLoadingE] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosCall('POST', '/event/p/get', true);
        console.log(response);
        if (response.events) {
          setUpcomingEvents(response.events.UPCOMING);
          setRegistrationOpen(response.events.REGISTRATION_OPEN);
          setRegistrationClose(response.events.REGISTRATION_CLOSED);
          setTicketOpen(response.events.TICKET_OPEN);
          setTicketClose(response.events.TICKET_CLOSED);
          setOngoingEvents(response.events.ONGOING);
          setLoadingE(false);
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

  if (loading || loadingE) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex flex-col">
        {/* main area */}
        {user.userContext.userData &&
          user.userContext.userData.name &&
          user.userContext.userData.photo_url && (
            <Header
              name={user.userContext.userData.name}
              photo_url={user.userContext.userData.photo_url}
            />
          )}
        {/* <SearchBar Icon={SearchNormal1} className="mt-6" /> */}
        <div className="flex flex-col mt-6 gap-4 z-10">
          <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
            Trending Events
          </p>
          <div className="overflow-x-auto flex gap-4 pb-6 px-4 -mx-4">
            {upcomingEvents?.map((event) => (
              <TrendingCard key={event.id} event={event} text="Coming Soon"/>
            ))}
            {ongoingEvents?.map((event) => (
              <TrendingCard key={event.id} event={event} text="Ongoing"/>
            ))}
            {registrationOpen?.map((event) => (
              <TrendingCard key={event.id} event={event} text="Registrations open"/>
            ))}
            {ticketOpen?.map((event) => (
              <TrendingCard key={event.id} event={event} text="Tickets Released"/>
            ))}
          </div>
        </div>
        {upcomingEvents && upcomingEvents.length != 0 && (
          <div className="flex flex-col mt- gap-4 z-10">
            <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
              Upcoming Events
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto mb-12">
              {upcomingEvents?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
        {registrationOpen && registrationOpen.length != 0 && (
          <div className="flex flex-col mt- gap-4 z-10">
            <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
              Registration Open
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto mb-12">
              {registrationOpen?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
        {ticketOpen && ticketOpen.length != 0 && (
          <div className="flex flex-col mt- gap-4 z-10">
            <p className="text-lg font-medium font-fira text-left text-foreground-light dark:text-foreground-dark">
              Registration Open
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-x-auto mb-12">
              {ticketOpen?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
      <FooterNav />
    </div>
  );
}
