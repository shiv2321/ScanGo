import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Products from "./pages/Products"
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CartPage from "./pages/CartPage";
import Navbar from "./components/Navbar";
import ScanPage from "./pages/ScanPage";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard"
import AddProduct from "./pages/AddProduct";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={< Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/scan" element={<ScanPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;