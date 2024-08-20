import { useContext, useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import indexRoutes from './routes/routes';
import { UserDataContext } from './contexts/userContext';
import ConditionalRoute from './routes/conditionalRoute';

import Loader from './components/Loader';

function App() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const userContext = useContext(UserDataContext);
  userContext.userData = user;
  userContext.setUserData = setUser;

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth > 720) {
            setIsMobile(true);
        } else {
            setIsMobile(false);
        }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);

  if (isMobile === null) {
    return <Loader />;
  } else if (isMobile) {
    return (
      <div className='flex flex-col h-screen justify-center items-center gap-8'>
      <p className='font-poppins text-3xl text-primary '>Mobile Required</p>
      <p className='font-poppins text-xl text-foreground-light'>Please use a mobile device and install the app to continue.</p>
      </div>
    )
  }

  return (
    <Routes>
      {indexRoutes.map((prop, key) =>
        prop.routeType ? (
          <Route
            path={prop.path}
            key={key}
            element={
              <ConditionalRoute
                routeType={prop.routeType as 'protected' | 'login'}
              >
                {prop.component}
              </ConditionalRoute>
            }
          />
        ) : (
          <Route path={prop.path} key={key} element={prop.component} />
        ),
      )}
      {/* <Route path="/404" element={<TechnicalError  />} /> */}
    </Routes>
  );
}

export default App;
