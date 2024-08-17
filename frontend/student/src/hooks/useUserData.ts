import { useContext } from 'react';
import { UserDataContext } from '../contexts/userContext';
import { axiosCall } from '../utils/api';

export const useUserData = () => {
  const userContext = useContext(UserDataContext);
  const fetch = async () => {
    if (userContext.userData == null) {
      try {
        const a = await axiosCall('POST', '/user/p/me', true);
        if (a.error) {
          throw new Error('error fetching');
        }
        if (a) {
          userContext.setUserData?.(a.user);
          return a.user as User;
        } else {
          return null;
        }
      } catch (err) {
        console.log(err);
        return null;
      }
    }
    return userContext.userData as User;
  };
  return { fetch, userContext };
};
