import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';

import Protected from './layouts/Protected';
import SidebarLayout from './layouts/SidebarLayout';

import Home from './pages/Home';
import Statistics from './pages/Statistics';
import EventDetails from './pages/EventDetails';
import NewEvent from './pages/NewEvent';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Participants from './pages/Participants';
import Attendance from './pages/Attendance';
import ApprovalTracker from './pages/ApprovalTracker';
import Announcements from './pages/Announcements';
import Budget from './pages/Budget';
import EventPermissions from './pages/EventPermissions';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route Component={Protected}>
        <Route Component={SidebarLayout}>
          <Route index Component={Home} />
          <Route path="statistics" Component={Statistics} />
          <Route path="new-event" Component={NewEvent} />
          <Route path="participants" Component={Participants} />
          <Route path="attendance" Component={Attendance} />
          <Route path="approvals" Component={ApprovalTracker} />
          <Route path="announcements" Component={Announcements} />
          <Route path="budget" Component={Budget} />
          <Route path="event-details/:id">
            <Route index Component={EventDetails} />
            <Route path="edit" Component={NewEvent} />
            <Route path="permissions" Component={EventPermissions} />
          </Route>
        </Route>
      </Route>
      <Route path="login" Component={Login} />
      <Route path="logout" Component={Logout} />
    </Route>,
  ),
);

export default router;
