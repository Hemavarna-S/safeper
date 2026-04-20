import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import NewPermit from "./pages/NewPermit";
import Permits from "./pages/Permits";
import Workers from "./pages/Workers";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-permit" element={<NewPermit />} />
            <Route path="/permits" element={<Permits />} />
            <Route path="/workers" element={<Workers />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
