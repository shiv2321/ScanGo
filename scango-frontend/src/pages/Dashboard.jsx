import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="bg-white shadow-md rounded-xl p-8 w-[90%] max-w-3xl">
                <h1 className="text-3xl font-bold text-center mb-6">
                    Welcome, {user?.name || "Guest"} 👋
                </h1>

                <p className="text-center text-gray-600 mb-8">
                    You are using in as{" "}
                    <span className="font-semibold text-blue-600">
                        {user?.role?.toUpperCase() || "Guest"}
                    </span>
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {/* Visible to everyone */}
                    <button
                        onClick={() => navigate("/")}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                    >
                        View Products
                    </button>

                    {/* Visible only to admin */}
                    {user?.role === "admin" && (
                        <button
                            onClick={() => navigate("/add-product")}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                        >
                            Add Product
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

}
export default Dashboard;