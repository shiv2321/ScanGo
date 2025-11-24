import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    // Load user and token from localStorage on initial load
    const [user, setUser] = useState(() => 
        JSON.parse(localStorage.getItem("user")) || null
    );

    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

    // Sync isLoggedIn after reload
    useEffect(() => {
        if (token && user) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [token, user]);

    // ------------------- LOGIN -------------------
    const handleLogin = async (username, password) => {
        try {
            const res = await api.post("/login/", { username, password });
            const data = res.data;

            const userData = {
                id: data.user_id,
                name: data.name,
                email: data.email,
                role: data.role,
            };

            // Update state
            setToken(data.token);
            setUser(userData);
            setIsLoggedIn(true);

            // Save to localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(userData));

            return { success: true };

        } catch (error) {
            console.error("Login Failed", error);
            return {
                success: false,
                message: error.response?.data?.non_field_errors?.[0] || "Login failed. Try again.",
            };
        }
    };

    // ------------------- LOGOUT -------------------
    const handleLogout = () => {
        setUser(null);
        setToken(null);
        setIsLoggedIn(false);

        localStorage.clear(); // clears token + user + any other saved values
        window.location.reload(); // resets React app completely
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoggedIn,
                handleLogin,
                handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
