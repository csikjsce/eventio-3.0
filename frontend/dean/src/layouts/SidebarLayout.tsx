import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

export default function SIdebarLayout() {
    return (
        <div className="p-8">
            <Sidebar />
            <Outlet />
        </div>
    );
}
