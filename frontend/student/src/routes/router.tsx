import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';

import HeaderLayout from '../layouts/HeaderLayout';
import FooterLayout from '../layouts/FooterLayout';
import Protected from '../layouts/Protected';

import Login from '../login/page';
import Logout from '../screens/logout/page';

import GetStarted from '../screens/getStarted/page';

import Home from '../screens/home/home';
import Calendar from '../screens/calendar/Calendar';
import Councils from '../screens/councils/Councils';
import Profile from '../screens/profile/Profile';
import MyEvents from '../screens/events/MyEvents';

import EventDetails from '../screens/events/EventDetails';
import Ticket from '../screens/ticket/tickets';
import TeamRegister from '../screens/events/TeamRegister';
import TeamDetails from '../screens/events/TeamDetails';
import ChildEvents from '../screens/events/ChildEvents';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route Component={Protected}>
        <Route Component={FooterLayout}>
          <Route Component={HeaderLayout}>
            <Route index Component={Home} />
            <Route path="calendar" Component={Calendar} />
            <Route path="councils" Component={Councils} />
            <Route path="profile/myevents" Component={MyEvents} />
          </Route>
          <Route path="profile" Component={Profile} />
        </Route>
        // TODO: rename the event routes
        <Route path="event-details/:id" Component={EventDetails} />
        <Route path="child-events/:id" Component={ChildEvents} />
        <Route path="ticket/:id" Component={Ticket} />
        <Route path="team-register/:id" Component={TeamRegister} />
        <Route path="team-details/:id" Component={TeamDetails} />
        <Route path="getting-started" Component={GetStarted} />
      </Route>
      <Route path="login" Component={Login} />
      <Route path="logout" Component={Logout} />
    </Route>,
  ),
);

export default router;
