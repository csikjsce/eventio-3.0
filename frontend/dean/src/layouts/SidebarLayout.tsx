import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

export default function SIdebarLayout() {
    return (
        <div className="flex">
            <div className="w-screen pl-[16.66vw]">
                <Sidebar />
                <Outlet />
            </div>
        </div>
    );
}
