import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { FaQrcode, FaPlus } from "react-icons/fa";

const Navbar = () => {
    const navigate = useNavigate();
    const { cart } = useContext(CartContext);
    const { user, token, handleLogout } = useAuth();


    const cartCount = cart ? cart.reduce((s, it) => s + (it.quantity || 1), 0) : 0;

    return (
        <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
                <img
                    src="/logo.jpg"
                    alt="ScanGo Logo"
                    className="w-16 h-16 rounded-full border-2 border-white"
                />
                <h1 className="text-2xl font-bold tracking-wide">ScanGo</h1>
            </Link>

            {/* Menu */}
            <div className="flex items-center space-x-4">
                <Link to="/" className="hover:text-yellow-300">Home</Link>
                {user?.role.toLowerCase() !== "admin" && (
                    <Link
                        to="/cart"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                    >
                        Cart ({cartCount})
                    </Link>
                )}
                {/* Visible only to admin */}
                {user?.role.toLowerCase() === "admin" && (
                    <button
                        onClick={() => navigate("/add-product")}
                        className="bg-white-600 text-purple w-10 h-10 flex items-center justify-center rounded-full hover:bg-yellow-700 transition duration-200 ease-in-out"
                        aria-label="Add Product"
                        title="Add Product"
                    >
                        <FaPlus size={20}/>
                    </button>
                )}
                {user?.role.toLowerCase() === "admin" && (
                    <button
                        onClick={() => navigate("/qr-management")}
                        className="border border-white/30 px-3 py-2 rounded-xl hover:bg-white/20 transition"
                    >
                        Manage QR Codes
                    </button>
                )}
                {user?.role.toLowerCase() !== "admin" && (
                    <button
                         onClick={() => navigate("/scan")}
                         className="border border-white/30 px-3 py-2 rounded-xl hover:bg-white/20 transition"
                         title="Scan QR Code"
                     >
                         <FaQrcode size={20} />
                     </button>
                    
                )}
                {token ? (
                    <button
                        onClick={handleLogout}
                        className="bg-white text-purple-600 px-4 py-1 rounded-full hover:bg-yellow-300 transition"
                    >
                        Logout
                    </button>
                ) : (
                    <>
                        <Link to="/login" className="hover:text-yellow-300">Login</Link>
                        <Link to="/signup" className="hover:text-yellow-300">Signup</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
