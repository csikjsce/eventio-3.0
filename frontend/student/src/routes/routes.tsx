import Onboarding from '../screens/getStarted/Onboarding.tsx';


const indexRoutes = [
  {
    path: '/',
    name: 'Home',
    component: <h1>Home</h1>,
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: <Onboarding />,
  },
  {
    path: '/event-details/:id',
    name: 'Event Details',
    component: <h1>Event Details</h1>,
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: <h1>Calendar</h1>,
  },
  {
    path: '/council-details/:id',
    name: 'Council Details',
    component: <h1>Council Details</h1>,
  },
  {
    path: '/councils',
    name: 'Councils',
    component: <h1>Councils</h1>,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: <h1>Profile</h1>,
  },
  {
    path: '/ticket/:id',
    name: 'Ticket',
    component: <h1>Ticket</h1>,
  },
  {
    path: '/contact-us',
    name: 'Contact Us',
    component: <h1>Contact Us</h1>,
  },
  {
    path: '/my-events',
    name: 'My Events',
    component: <h1>My Events</h1>,
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
];

export default indexRoutes;
