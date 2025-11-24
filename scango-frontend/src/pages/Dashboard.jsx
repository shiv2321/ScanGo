import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="bg-white shadow-md rounded-xl p-8 w-[90%] max-w-3xl">
                <h1 className="text-3xl font-bold text-center mb-6">
                    Welcome, {user?.name || "Guest"} 👋
                </h1>

                <p className="text-center text-gray-600 mb-8">
                    You are logged in as{" "}
                    <span className="font-semibold text-blue-600">
                        {user?.role?.toUpperCase() || "GUEST"}
                    </span>
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {/* Visible to all users */}
                    <button
                        onClick={() => navigate("/products")}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                    >
                        View Products
                    </button>

                    {/* Hide scan button for admin */}
                    {user?.role?.toLowerCase() !== "admin" && (
                        <button
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            onClick={() => navigate("/scan")}
                        >
                            Scan QR Code
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
