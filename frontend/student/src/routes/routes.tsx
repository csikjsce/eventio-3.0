import Login from '../login/page';
import Calendar from '../screens/calendar/Calendar';
import Councils from '../screens/councils/Councils';
import EventDetails from '../screens/events/EventDetails';
import MyEvents from '../screens/events/MyEvents';
import GetStarted from '../screens/getStarted/page';
import Home from '../screens/home/home';
import Logout from '../screens/logout/page';
import Profile from '../screens/profile/Profile';
import Ticket from '../screens/ticket/tickets';

const indexRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: <Login />,
    routeType: 'login',
  },
  {
    path: '/getting-started',
    name: 'getStarted',
    component: <GetStarted />,
    routeType: 'protected',
  },
  {
    path: '/',
    name: 'Home',
    component: <Home />,
    routeType: 'protected',
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: <h1>Onboarding</h1>,
  },
  {
    path: '/event-details/:id',
    name: 'Event Details',
    component: <EventDetails />,
    routeType: 'protected',
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: <Calendar />,
  },
  {
    path: '/council-details/:id',
    name: 'Council Details',
    component: <h1>Council Details</h1>,
  },
  {
    path: '/councils',
    name: 'Councils',
    component: <Councils />,
    routeType: 'protected',
  },
  {
    path: '/profile',
    name: 'Profile',
    component: <Profile />,
    routeType: 'protected',
  },
  {
    path: '/ticket/:id',
    name: 'Ticket',
    component: <Ticket />,
    routeType: 'protected',
  },
  {
    path: '/contact-us',
    name: 'Contact Us',
    component: <h1>Contact Us</h1>,
  },
  {
    path: '/my-events',
    name: 'My Events',
    component: <MyEvents />,
  },
  {
    path: '/child-events/:parentId',
    name: 'Child Events',
    component: <h1>Child Events</h1>,
  },
  {
    path: '/search-events',
    name: 'Search Events',
    component: <h1>Search Events</h1>,
  },
  {
    path: '/logout',
    name: 'Logout',
    component: <Logout />,
  },
];

export default indexRoutes;
