import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import NewPermit from "./pages/NewPermit";
import Permits from "./pages/Permits";
import Workers from "./pages/Workers";
import Login from "./pages/Login";
import QRScanner from "./pages/QRScanner";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-permit" element={<NewPermit />} />
            <Route path="/permits" element={<Permits />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/scanner" element={<QRScanner />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
