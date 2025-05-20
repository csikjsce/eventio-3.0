import { useEffect, useState } from "react";
// import { useUserData } from "../hooks/useUserData";
import { UserDataContext } from "../contexts/userContext";
import EventsDataContext from "../contexts/EventsDataContext";
import { useNavigate, Outlet } from "react-router-dom";

import { axiosCall } from "../lib/api";
import axios from "axios";

export default function Protected() {
    const [eventsData, setEventsData] = useState<Events | null>(null);
    const [userData, setUserData] = useState<User | null>(null);

    const navigate = useNavigate();

    const fetchUser = async () => {
        try {
            const response = await axiosCall("POST", "/user/p/me", true);
            if (response.error) {
                throw new Error("error fetching");
            }
            if (response && response.user && response.user.role === "FACULTY"|| response.user?.role=== "PRINCIPAL") {
                setUserData(response.user);
                return { status: 200 };
            } else {
                setUserData(null);
                return { status: 400 };
            }
        } catch (err) {
            if ((err as { status: number; error: string }).status === 401) {
                return { status: 401 };
            }
            console.error(err);
            return { status: 400 };
        }
    };
    const refreshEventsData = async () => {
        try {
            const response = await axiosCall("POST", "/event/p/get", true);
            if (response.error) {
                throw new Error("error fetching");
            }

            console.log("API response events:", response.events);

            if (response && response.events) {
                setEventsData(response.events);
            } else {
                setEventsData(null);
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        const handler = async () => {
            const resp = await fetchUser();
            if (resp.status === 401) {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) {
                    navigate("/logout");
                } else {
                    try {
                        const response = await axios.request({
                            baseURL: import.meta.env.VITE_APP_SERVER_ADDRESS,
                            url: "/api/v1" + `/auth/refresh-token`,
                            method: "POST",
                            data: {
                                refreshToken,
                            },
                        });
                        localStorage.setItem(
                            "accessToken",
                            response.data.accessToken,
                        );
                        await fetchUser();
                    } catch {
                        navigate("/logout");
                    }
                }
            } else if (resp.status === 400) {
                navigate("/logout");
            }
            await refreshEventsData();
        };

        handler();
    }, []);

    return (
        <UserDataContext.Provider value={{ userData, setUserData }}>
            <EventsDataContext.Provider
                value={{ eventsData, setEventsData, refreshEventsData }}
            >
                <Outlet />
            </EventsDataContext.Provider>
        </UserDataContext.Provider>
    );
}
