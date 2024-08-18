import { useContext, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import indexRoutes from './routes/routes';
import { UserDataContext } from './contexts/userContext';
import ConditionalRoute from './routes/conditionalRoute';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const userContext = useContext(UserDataContext);
  userContext.userData = user;
  userContext.setUserData = setUser;

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
