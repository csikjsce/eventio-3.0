import { useEffect, useState } from 'react';
// import { useUserData } from "../hooks/useUserData";
import { UserDataContext } from '../contexts/userContext';
import EventsDataContext from '../contexts/EventsDataContext';
import { useNavigate, Outlet } from 'react-router-dom';

import { axiosCall } from '../utils/api';

export default function Protected() {
  const [events, setEvents] = useState<Events | null>(null);
  const [userData, setUserData] = useState<User | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosCall('POST', '/user/p/me', true);
        if (response.error) {
          throw new Error('error fetching');
        }
        if (response && response.user) {
          setUserData(response.user);
          if (
            response.user.phone_number == null ||
            response.user.roll_number == null
          ) {
            navigate('/getting-started');
          }
        } else {
          setUserData(null);
        }
      } catch (err) {
        navigate('/logout');
        if ((err as {status: number, error: string}).status !== 401) {
          console.error(err);
        }
      }
    };
    const fetchEvents = async () => {
      try {
        const response = await axiosCall('POST', '/event/p/get', true);
        if (response.error) {
          throw new Error('error fetching');
        }
        if (response && response.events) {
          setEvents(response.events);
        } else {
          setEvents(null);
        }
      } catch (err) {
        console.error(err);
        throw err;
      }
    };

    const handler = async () => {
      await fetchUser();
      await fetchEvents();
    };

    handler();
  }, []);


  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      <EventsDataContext.Provider value={{ events, setEvents }}>
        <Outlet />
      </EventsDataContext.Provider>
    </UserDataContext.Provider>
  );
}
