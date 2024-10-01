import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';
import { axiosCall } from '../utils/api';
import axios from 'axios';

export default function Protected() {
  const [userData, setUserData] = useState<User | null>(null);
  const [eventsData, setEventsData] = useState<Events | null>(null);

  useEffect(() => {
    console.log(eventsData);
  }, [eventsData]);

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
          return { status: 200 };
        } else {
          setUserData(null);
          return { status: 400 };
        }
      } catch (err) {
        if ((err as { status: number; error: string }).status === 401) {
          return { status: 401 };
        }
        console.error(err);
        return { status: 400 };
      }
    };
    const fetchEvents = async () => {
      try {
        const response = await axiosCall('POST', '/event/p/get', true);
        if (response.error) {
          throw new Error('error fetching');
        }
        if (response && response.events) {
          setEventsData(response.events);
        } else {
          setEventsData(null);
        }
      } catch (err) {
        console.error(err);
        throw err;
      }
    };

    const handler = async () => {
      const resp = await fetchUser();
      if (resp.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          navigate('/logout');
        } else {
          try {
            const response = await axios.request({
              baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
              url: '/api/v1' + `/auth/refresh-token`,
              method: 'POST',
              data: {
                refreshToken,
              },
            });
            localStorage.setItem('accessToken', response.data.accessToken);
            await fetchUser();
          } catch {
            navigate('/logout');
          }
        }
      }
      await fetchEvents();
    };

    handler();
  }, []);
  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      <EventsDataContext.Provider value={{ eventsData, setEventsData }}>
        <Outlet />
      </EventsDataContext.Provider>
    </UserDataContext.Provider>
  );
}
