import EventRoute from "../screens/home/event";
import Calander from "../screens/home/calander";
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
                    <Route index Component={EventRoute} />
                    <Route path="calendar" Component={Calander} />
                    <Route path="event-details/:id"></Route>
                </Route>
            </Route>
            <Route path="login" Component={Login} />
            <Route path="logout" Component={Logout} />
        </Route>,
    ),
);

export default router;
