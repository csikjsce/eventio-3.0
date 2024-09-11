import { createContext } from "react";
import { Dispatch } from "react";

interface UserDataContextInterface {
    userData: User | null;
    setUserData: Dispatch<User> | null;
}

const data = {
    userData: null,
    setUserData: null,
};

const UserDataContext = createContext<UserDataContextInterface>(data);

export default UserDataContext;
