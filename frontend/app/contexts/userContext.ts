"use client";

import { createContext } from "react";
import type { User } from "@/types/eventio";

export interface UserDataContextInterface {
  userData: User | null;
  setUserData: React.Dispatch<React.SetStateAction<User | null>> | null;
}

export const UserDataContext = createContext<UserDataContextInterface>({
  userData: null,
  setUserData: null,
});
