import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

function ProductCard({ id, name, price, image }) {
  const { addToCart } = useContext(CartContext);
  const [ added, setAdded ] = useState(false);

  return (
    <div className="border rounded-2xl shadow p-4 w-64 bg-white hover:shadow-lg transition">
      <img
        src={image || "/placeholder.png"}
        alt={name || "Product"}
        className="h-40 w-full object-cover rounded-xl"
        onError={(e) => (e.target.src = "/placeholder.png")}
      />
      <h3 className="text-lg font-semibold mt-2">{name}</h3>
      <p className="text-gray-600">₹{price}</p>
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
    </div>
  );
}


export default ProductCard;
