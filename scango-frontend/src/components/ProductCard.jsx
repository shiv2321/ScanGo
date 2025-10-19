function ProductCard({ name, price, image }) {
  return (
    <div className="border rounded-2xl shadow p-4 w-64 bg-white hover:shadow-lg transition">
      <img
        src={image}
        alt={name}
        className="h-40 w-full object-cover rounded-xl"
      />
      <h3 className="text-lg font-semibold mt-2">{name}</h3>
      <p className="text-gray-600">₹{price}</p>
      <button className="bg-blue-500 text-white w-full py-2 mt-3 rounded-xl hover:bg-blue-600">
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
