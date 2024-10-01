import { RouterProvider } from "react-router-dom";
import router from "../src/routes/routes";

function App() {
    return <RouterProvider router={router} />;
}

export default App;
