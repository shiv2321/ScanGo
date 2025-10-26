import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ 
        username: "", 
        email: "", 
        password: "", 
        ConfirmPassword: "",
        role:"customer",
        otp: "" 
    });
    const [error, setError] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [verified, setVerfied] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSentOtp = async () => {
        try {
            await api.post("/api/send-admin-otp/",{
                email: form.email,
            });
            setOtpSent(true);
            setError("");
        } catch (err) {
            setError("Failed to send OTP. Try again.")
        }
    };

    const handleOtpVerify = async () => {
        try {
            const res = await api.post("/api/verify-admin-otp/", {
                email: form.email,
                otp: form.otp,
            });
            if (res.data.verified) {
                setVerfied(true);
                setError("");
            } else {
                setError("Invalid OTP. Try again.");
            }
        } catch (err) {
            setError("Error veryfying OTP. Try again. ");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (form.password !== form.ConfirmPassword) {
            setError("Password do not match.");
            return;
        }
        if (form.role.toLocaleLowerCase() === "admin" && !verified) {
            setError("Please verify OTP before creating admin account.");
            return;
        }
        try{
            api
                .post("/api/signup/", form)
                .then((res) => {
                    console.log(res.data);
                    navigate("/login");
                })
                .catch((err) => {
                    setError(err.response?.data?.details || "Signup Failed");
                });
        }catch (err) {
            setError(err.response?.data?.details || "Signup Failed");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form className="bg-white p-8 rounded-xl shadow-md w-96">
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

                {form.role.toLocaleLowerCase() === "admin" && !verified && (
                    <>
                        {!otpSent ? (
                            <button
                                type="submit"
                                onClick={handleSentOtp}
                                className="bg-yellow-500 text-white w-full py-3 rounded-xl mb-4 hover:bg-yellow-600"
                            >
                                Send OTP
                            </button>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="Enter OTP"
                                    value={form.otp}
                                    onChange={handleChange}
                                    className="w-full mb-4 p-3 border rounded-xl"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleOtpVerify}
                                    className="bg-green-500 text-white w-full py-3 rounded-xl mb-4 hover:bg-green-600"
                                >
                                    Verify OTP
                                </button>
                            </>                                
                        )}
                    </>
                )}
                
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-xl"
                    required
                />

                <input
                    type="password"
                    name="ConfirmPassword"
                    placeholder="Confirm Password"
                    value={form.ConfirmPassword}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-xl"
                    required
                />
                <button 
                    type="submit"
                    className="bg-blue-500 text-white w-full py-3 rounded-xl hover:bg-blue-600"
                    onClick={handleSubmit}
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
}

export default Signup;  