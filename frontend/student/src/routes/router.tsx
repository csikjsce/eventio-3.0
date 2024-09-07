import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';

import HeaderLayout from '../layouts/HeaderLayout';
import FooterLayout from '../layouts/FooterLayout';
import Protected from '../layouts/Protected';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route Component={Protected}>
        <Route Component={FooterLayout}>
          <Route Component={HeaderLayout}>
            <Route
              index
              lazy={async () => {
                const Home = await import('../screens/home/home');
                return { Component: Home.default };
              }}
            />
            <Route
              path="calendar"
              lazy={async () => {
                const Calendar = await import('../screens/calendar/Calendar');
                return { Component: Calendar.default };
              }}
            />
            <Route
              path="councils"
              lazy={async () => {
                const Councils = await import('../screens/councils/Councils');
                return { Component: Councils.default };
              }}
            />
          </Route>
          <Route
            path="profile"
            lazy={async () => {
              const Profile = await import('../screens/profile/Profile');
              return { Component: Profile.default };
            }}
          />
        </Route>
        <Route
          path="event-details/:id"
          lazy={async () => {
            const EventDetails = await import('../screens/events/EventDetails');
            return { Component: EventDetails.default };
          }}
        />
        <Route
          path="ticket/:id"
          lazy={async () => {
            const Tickets = await import('../screens/ticket/tickets');
            return { Component: Tickets.default };
          }}
        />
        <Route
          path="getting-started"
          lazy={async () => {
            const GetStarted = await import('../screens/getStarted/page');
            return { Component: GetStarted.default };
          }}
        />
      </Route>
      <Route
        path="login"
        lazy={async () => {
          const Login = await import('../login/page');
          return { Component: Login.default };
        }}
      />
      <Route
        path="logout"
        lazy={async () => {
          const Logout = await import('../screens/logout/page');
          return { Component: Logout.default };
        }}
      />
    </Route>,
  ),
);

export default router;
