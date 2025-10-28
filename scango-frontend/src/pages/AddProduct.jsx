import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
    const { user, token, isLoggedIn } = useAuth();
    const navigate = useNavigate();


    const [form, setForm] = useState({
        name: "",
        price: "",
        qr_code_value: "",
        image: null,
        imagePreview: null,
    });


    useEffect(() => {
        if (!isLoggedIn || user?.role?.toLowerCase() !== 'admin') {
            navigate("/login")
        }

    }, [isLoggedIn, user, navigate, form.imagePreview]);

    
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file){
            const imageURL = URL.createObjectURL(file);
            setForm({ ...form, image: file, imagePreview: imageURL });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("price", form.price);
        formData.append("qr_code_value", form.qr_code_value);
        if (form.image) formData.append("product_image", form.image);

        try {
            await api.post(
                "/new_product/",
                formData,
                { headers: { Authorization: `Token ${token}` } }
            );

            setMessage("Product added successfully!");
            setForm({ name: "", price: "", qr_code_value: "", image: null });

            setTimeout(() => navigate("/"), 1000)
        } catch (err) {
            console.error("Error Adding New product: ", err);
            setMessage("Failed to add a New product, Try Again");
        }
    };
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-[90%] max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Add New Product
                </h2>
                {message && <p className="text-center mb-4"> {message} </p>}

                <input
                    type="text"
                    name="name"
                    placeholder="Product-Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-xl"
                    required
                />

                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-xl"
                    required
                />

                <input
                    type="text"
                    name="qr_code_value"
                    placeholder="QR-Value"
                    value={form.qr_code_value}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-xl"
                    required
                />

                <input
                    type="file"
                    accept="image/"
                    onChange={handleFileChange}
                    className="w-full mb-4"
                />
                {form.imagePreview && (
                    <div className="flex flex-col items-center">
                        <img
                            src={form.imagePreview}
                            alt="Product-Preview"
                            className="w-32 h-32 object-contain border rounded mb-2"
                        />
                        <span className="text-sm text-gray-600">Image Preview</span>
                    </div>
                )}

                <button
                    type="submit"
                    className="bg-blue-500 text-white w-full py-3 rounded-xl hover:bg-blue-600 transition"
                >
                    Add Product
                </button>
            </form>
        </div>
    );
};

export default AddProduct;
