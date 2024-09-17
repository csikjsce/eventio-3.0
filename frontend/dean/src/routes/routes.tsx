import EventRoute from "../screens/home/event";
import Sidebar from "../components/sidebar";
import Calander from "../screens/home/calander";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
    return (
        <Router>
            <div className="p-4 flex flex-row gap-4">
                <div>
                    <Sidebar />
                    <Routes>
                        <Route path="/events" element={<EventRoute />} />
                        <Route path="/calendar" element={<Calander />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
