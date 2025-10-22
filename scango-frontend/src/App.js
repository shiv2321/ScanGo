import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CartPage from "./pages/CartPage";
import Navbar from "./components/Navbar";
import ScanPage from "./pages/ScanPage";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard"


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/dashboard" element={< Dashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/scan" element={<ScanPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;