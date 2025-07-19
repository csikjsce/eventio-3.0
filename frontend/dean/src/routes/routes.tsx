import Home from "../screens/Home";
import Statistics from "../screens/Statistics";
import Login from "../screens/Login";
import Logout from "../screens/Logout";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import Protected from "../layouts/Protected";
import SidebarLayout from "../layouts/SidebarLayout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route Component={Protected}>
        <Route Component={SidebarLayout}>
          <Route index Component={Home} />
          <Route path="statistics" Component={Statistics} />
        </Route>
      </Route>
      <Route path="login" Component={Login} />
      <Route path="logout" Component={Logout} />
    </Route>,
  ),
  {
  basename: '/dean',
  }
);

export default router;
