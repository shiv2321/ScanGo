import { createContext, useContext, useState } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => 
        JSON.parse(localStorage.getItem("user")) || null
    );
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!token);

    const handleLogin = async (username, password) => {
        try {
            const res = await api.post("/api/login/",{
                username,
                password,
            });
            
            const data = res.data;
            console.log("Login Response: ",data);

            const userData = {
                id : data.user_id,
                name: data.name,
                email : data.email,
                role : data.role,
            };

            setToken(data.token);
            setUser(userData);
            setIsLoggedIn(true);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(userData));

            return { success : true }
        
        } catch (error) {
            console.error("Login Faileed", error);
            return {
                sucess : false,
                message : 
                error.resonse?.data?.non_field_errors?.[0] || "Login failed Try Again."
            };
        }

    }

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        setIsLoggedIn(false);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

    };

    return (
        <AuthContext.Provider
            value={{user, token, isLoggedIn, handleLogin, handleLogout}}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);