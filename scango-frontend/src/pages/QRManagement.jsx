import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { FaDownload, FaPrint } from "react-icons/fa";

export default function QRManagement() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/management/")
            .then((res) => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch QR codes", err);
                setLoading(false);
            });
    }, []);

    if (!user || user.role.toLowerCase() !== "admin") {
        return (
            <div className="min-h-screen flex justify-center items-center text-xl font-semibold">
                ❌ Access Denied — Admin Only
            </div>
        );
    }

    if (loading) {
        return <p className="text-center mt-20">Loading QR Codes...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-center mb-8">📲 QR Code Management</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                    <div key={p.id} className="bg-white shadow rounded-xl p-4">
                        <h2 className="text-lg font-semibold mb-2">{p.name}</h2>
                        {p.qr_code_img_url ? (
                            <img
                                src={p.qr_code_img_url}
                                alt="QR Code"
                                className="w-full h-48 object-contain bg-gray-50 rounded-lg p-2"
                            />
                        ) : (
                            <p className="text-gray-500 italic">No QR Code Available</p>
                        )}

                        {p.product_image_url && (
                            <img
                                src={p.product_image_url}
                                className="w-16 h-16 object-cover rounded-md mt-2"
                            />
                        )}

                        <div className="flex justify-between mt-4">
                            {p.qr_code_img_url && (
                                <a
                                    href={p.qr_code_img_url}
                                    download
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    <FaDownload /> Download
                                </a>
                            )}

                            {p.qr_code_img_url && (
                                <button
                                    onClick={() => window.open(p.qr_code_img_url, "_blank")}
                                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                >
                                    <FaPrint /> Print
                                </button>
                            )}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
