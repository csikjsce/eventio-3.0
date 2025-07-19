import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';

import Protected from './layouts/Protected';
import SidebarLayout from './layouts/SidebarLayout';

import Home from './pages/Home';
import Statistics from './pages/Statistics'
import EventDetails from './pages/EventDetails';
import NewEvent from './pages/NewEvent';
import Login from './pages/Login';
import Logout from './pages/Logout';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route Component={Protected}>
        <Route Component={SidebarLayout}>
          <Route index Component={Home} />
          <Route path="statistics" Component={Statistics} />
          <Route path="new-event" Component={NewEvent} />
          <Route path="event-details/:id">
            <Route index Component={EventDetails} />
            <Route path="edit" Component={NewEvent} />
          </Route>
        </Route>
      </Route>
      <Route path="login" Component={Login} />
      <Route path="logout" Component={Logout} />
    </Route>,
  ),
  {
    basename: '/council',
  }
);

export default router;
