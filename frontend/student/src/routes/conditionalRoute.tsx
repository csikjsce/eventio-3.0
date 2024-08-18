import React, { useEffect, useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import Loader from '../components/Loader';

export default function ConditionalRoute({
  routeType,
  children,
}: ConditionalRouteProps): JSX.Element {
  const { fetch, userContext } = useUserData();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUserData = async () => {
      if (!userContext.userData) {
        const user = await fetch();
        console.log('User fetched', user);
        if (routeType === 'login' && user) {
          window.location.href = '/';
        } else if (routeType === 'protected' && !user) {
          window.location.href = '/login';
        } else {
          setLoading(false);
        }
      } else {
        if (routeType === 'login' && userContext.userData) {
          window.location.href = '/';
        } else if (routeType === 'protected' && !userContext.userData) {
          window.location.href = '/login';
        } else {
          setLoading(false);
        }
      }
    };

    checkUserData().catch((err) => {
      console.error(err.name);
    });
  }, [routeType, fetch, userContext.userData]);

  return <>{loading ? <Loader /> : children}</>;
}

export type ConditionalRouteProps = {
  routeType: 'login' | 'protected';
  children: React.ReactNode;
};
