import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import UserDataContext from '../contexts/UserDataContext';
import EventsDataContext from '../contexts/EventsDataContext';
import Loader from '../components/Loader';

export default function Protected() {
  const [userData, setUserData] = useState<User | null>(null);
  const [eventsData, setEventsData] = useState<Events | null>(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  async function fetchUser(): Promise<{ status: number }> {
    try {
      const res = await axios.request({
        baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
        url: '/api/v1/user/p/me',
        method: 'POST',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
      });
      const user = res.data?.user;
      if (!user || user.role !== 'COUNCIL') return { status: 400 };
      setUserData(user);
      return { status: 200 };
    } catch (err: unknown) {
      const e = err as { response?: { status: number } };
      if (e?.response?.status === 401) return { status: 401 };
      return { status: 400 };
    }
  }

  const refreshEventsData = async () => {
    try {
      const res = await axios.request({
        baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
        url: '/api/v1/event/p/get',
        method: 'POST',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
      });
      if (res.data?.events) setEventsData(res.data.events);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    (async () => {
      let resp = await fetchUser();
      if (resp.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) { navigate('/logout'); return; }
        try {
          const r = await axios.post(
            import.meta.env.VITE_APP_SERVER_ADDRESS + '/api/v1/auth/refresh-token',
            { refreshToken },
          );
          localStorage.setItem('accessToken', r.data.accessToken);
          resp = await fetchUser();
        } catch {
          navigate('/logout');
          return;
        }
      }
      if (resp.status !== 200) { navigate('/logout'); return; }
      await refreshEventsData();
      setReady(true);
    })();
  }, []);

  const eventsList: EventData[] = [
    ...(eventsData?.DRAFT                || []),
    ...(eventsData?.APPLIED_FOR_APPROVAL || []),
    ...(eventsData?.UNLISTED             || []),
    ...(eventsData?.UPCOMING             || []),
    ...(eventsData?.REGISTRATION_OPEN    || []),
    ...(eventsData?.REGISTRATION_CLOSED  || []),
    ...(eventsData?.TICKET_OPEN          || []),
    ...(eventsData?.TICKET_CLOSED        || []),
    ...(eventsData?.ONGOING              || []),
    ...(eventsData?.COMPLETED            || []),
    ...(eventsData?.PRIVATE              || []),
  ];

  if (!ready) return <Loader />;

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      <EventsDataContext.Provider value={{ eventsData, setEventsData, eventsList, refreshEventsData }}>
        <Outlet />
      </EventsDataContext.Provider>
    </UserDataContext.Provider>
  );
}
