import { Dispatch } from "react";

export interface UserDataContextInterface {
    userData: User | null;
    setUserData: Dispatch<User> | null;
}
