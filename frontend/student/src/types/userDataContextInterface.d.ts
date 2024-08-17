import { Dispatch } from 'react';

export interface UserDataContextInterface {
  userData: User | null;
  setUserData: Dispatch<UserDataInterface> | null;
}
