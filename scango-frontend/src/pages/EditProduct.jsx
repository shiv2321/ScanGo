import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [product, setProduct] = useState({
        name: "",
        price: "",
        qr_code_value: "",
        image: null,
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products_details/${id}/`, {
                    headers: { Authorization: `Token ${token} ` },
                });
                setProduct(res.data);
            } catch (err) {
                console.error("Error Fetching Product: ", err);
            }
        };
        fetchProduct();
    }, [id, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("name", product.name);
            formData.append("price", product.price);

            if (imageFile) formData.append("product_image", imageFile);

            await api.put(
                `/products_details/${id}/`,
                formData,
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );
            setMessage("Product Updated Successfully");
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            console.error("Update Failed: ", err);
            setMessage("Failed to update Product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

            {message && <p className="mb-4 text-center text-blue-600">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        placeholder="Product Name"
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div>
                    <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        placeholder="Price"
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700"> QR Code Value </label>
                    <input
                        type="text"
                        value={product.qr_code_value}
                        className="w-full p-2 border rounded bg-gray-100 text-gray-600"
                        readOnly
                    />
                </div>
                {product.qr_code_img && (
                    <div className="flex flex-col items-center">
                        <img
                            src={`${product.qr_code_img}`}
                            alt="QR Code"
                            className="w-32 h-32 object-contain border rounded mb-2"
                        />
                        <span className="text-sm text-gray-600">QR Code </span>
                    </div>
                )}
                {product.product_image && (
                    <div className="flex flex-col items-center">
                        <img
                            src={`${product.product_image}`}
                            alt="Product"
                            className="w-32 h-32 object-contain border rounded mb-2"
                        />
                        <span className="text-sm text-gray-600">Current Product Image</span>
                    </div>
                )}
                <div>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 mt-4 rounded-xl ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                        } text-white font-semibold`}
                >
                    {loading ? "Saving..." : "Update Product"}
                </button>
            </form>
        </div>
    );
};

export default EditProduct;
