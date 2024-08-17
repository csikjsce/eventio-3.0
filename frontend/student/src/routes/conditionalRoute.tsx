import React, { useEffect, useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import Loader from '../components/Loader';

export default function ConditionalRoute({
  routeType,
  children,
}: ConditionalRouteProps): JSX.Element {
  const useUser = useUserData();
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    useUser
      .fetch()
      .then((user) => {
        console.log('User fetched', user);
        if (routeType === 'login' && user) {
          window.location.href = '/';
        } else if (routeType === 'protected' && !user) {
          window.location.href = '/login';
        } else {
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        console.error(err.name);
        // window.location.href = '/something-went-wrong';
      });
  }, [routeType, useUser]);
  return <>{loading ? <Loader /> : children}</>;
}

export type ConditionalRouteProps = {
  routeType: 'login' | 'protected';
  children: React.ReactNode;
};
