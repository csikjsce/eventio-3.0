import Home from '../screens/home/home';
import Councils from '../screens/councils/Councils';
import Calendar from '../screens/calendar/Calendar';
import Profile from '../screens/profile/Profile';
import MyEvents from '../screens/events/MyEvents';
import { Component } from 'iconsax-react';
const indexRoutes = [
  {
    path: '/',
    name: 'Home<',
    component: <Home />,
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: <h1>Onboarding</h1>,
  },
  {
    path: '/event-details/:id',
    name: 'Event Details',
    component: <h1>Event Details</h1>,
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
  },
  {
    path: '/profile',
    name: 'Profile',
    component: <Profile />,
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
    component:<MyEvents/>,
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
  }
];

export default indexRoutes;
