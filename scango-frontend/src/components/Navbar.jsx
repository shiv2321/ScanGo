import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const {cart} = useContext(CartContext);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/")
    };

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
            <div className="space-x-4">
                <Link to="/" className="hover:text-yellow-300">Home</Link>
                <Link
                    to="/cart"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                >
                    Cart ({cartCount})
                </Link>
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