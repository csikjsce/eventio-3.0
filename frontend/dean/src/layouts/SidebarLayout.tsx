import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

export default function SIdebarLayout() {
    return (
        <div className="py-8 px-2 pl-[272px]">
            <Sidebar />
            <Outlet />
        </div>
    );
}
