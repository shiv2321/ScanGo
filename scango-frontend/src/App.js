import { BrowserRouter as Router, Routes, Route  } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CartPage from "./pages/CartPage";
import Navbar from "./components/Navbar";


function App() {
  return (
    <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/cart" element={<CartPage />} />

        </Routes>
    </Router>
  );
}

export default App;