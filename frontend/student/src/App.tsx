import { Route, Routes } from 'react-router-dom';
import indexRoutes from './routes/routes';
import ConditionalRoute from './routes/conditionalRoute';

function App() {
  const isLoggedIn = true; // subject to change after building context

  return (
    <Routes>
      {indexRoutes.map((prop, key) => {
        return (
          <Route
            path={prop.path}
            key={key}
            element={
              <ConditionalRoute condition={isLoggedIn} redirectTo="/">
                {prop.component}
              </ConditionalRoute>
            }
          ></Route>
        );
      })}
      {/* <Route path="/404" element={<TechnicalError  />} /> */}
    </Routes>
  );
}

export default App;
