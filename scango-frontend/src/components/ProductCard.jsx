import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaTrash } from "react-icons/fa";
import api from "../api";

function ProductCard({ id, name, price, image, onDelete }) {
  const { addToCart } = useContext(CartContext);
  const [ added, setAdded ] = useState(false);
  const {user, token} = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeleting(true);
      await api.delete(`http://127.0.0.1:8000/api/products_details/${id}`, {
        headers: {Authorization: `Token ${token}`}
      });

      setDeleting(false);
      if (onDelete) onDelete(id);
    } catch (error) {

      console.error("Error Deleting product: ",error);
      setDeleting(false);
    }
  };

  return (
    <div className="relative border rounded-2xl shadow p-4 w-64 bg-white hover:shadow-lg transition">
      {user?.role?.toLowerCase() === "admin" && (
        <button 
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          title="Delete Product"
        >
          <FaTrash />
        </button>
      )}
      <img
        src={image
          ? `http://127.0.0.1:8000${image}`
          : "/placeholder.png"}
        alt={name || "Product"}
        className="h-48 w-full object-contain rounded-xl bg-gray-50 p-2"
        onError={(e) => (e.target.src = "/placeholder.png")}
      />
      <h3 className="text-lg font-semibold mt-2">{name}</h3>
      <p className="text-gray-600">₹{price}</p>
      
      {user?.role?.toLowerCase() === "customer" && (
        <button
          onClick={() => {addToCart({id, name, price, image});
              setAdded(true);
              setTimeout(() => setAdded(false), 1000);
            }}
          className={`w-full py-2 mt-3 rounded-xl transition ${added
              ? "bg-green-500 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
        >
          {added ? "Added!" : "Add to Cart"}
        </button>
      )}
    </div>
  );
}


export default ProductCard;
