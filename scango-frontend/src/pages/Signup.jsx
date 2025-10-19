import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", email: "", password: "", role:"customer" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .post("http://127.0.0.1:8000/api/signup/", form)
            .then((res) => {
                console.log(res.data);
                navigate("/login");
            })
            .catch((err) => {
                setError(err.response?.data?.details || "Signup Failed");
            });
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-96"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-xl"
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-xl"
                />
                {/* Role DropDown*/}
                <div className="mb-4">
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700">Select Role</label> 
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full mb-4 p-3 border rounded-xl"
                    >
                        <option value="customer">Customer</option> 
                        <option value="admin">Admin</option> 
                        
                    </select>
                    
                </div>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-xl"
                    required
                />

                <button className="bg-blue-500 text-white w-full py-3 rounded-xl hover:bg-blue-600">
                    Sign Up
                </button>
            </form>
        </div>
    );

}

export default Signup;  