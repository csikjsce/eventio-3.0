import Namaste from "../assets/Namaste.svg";
import { useContext } from "react";
import { UserDataContext } from "../contexts/userContext";

export default function GreetingSection() {
    const { userData } = useContext(UserDataContext);
    return (
        <header className="bg-card flex w-auto flex-row justify-between rounded-2xl pl-6 p-1">
            <div className="my-auto py-3">
                <div className="font-marcellus text-3xl text-foreground">
                    Namaste <strong>{userData?.name}</strong>!
                </div>
                <p className="font-poppins mt-2 text-base leading-6 text-foreground">
                    How are you feeling today?
                </p>
            </div>
            <div className="my-auto w-56">
                <img loading="lazy" src={Namaste} />
                <img loading="lazy" src={Namaste} />
            </div>
        </header>
    );
}
