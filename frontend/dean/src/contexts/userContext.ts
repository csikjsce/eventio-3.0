import { createContext } from "react";
import { UserDataContextInterface } from "../types/userDataContextInterface.ts";

const userData = {
    userData: null,
    setUserData: null,
};

export const UserDataContext =
    createContext<UserDataContextInterface>(userData);
