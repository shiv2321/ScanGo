import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Trash2 } from "lucide-react";


function CartPage() {
    const { cart, removeFromCart, clearCart, ItemDecrease, ItemIncrease } = useContext(CartContext);
    /* const [cartItems, setCartItems] = useState(cart);
    const token = localStorage.getItem("token"); */

    const handleRemove = (id) => {
        removeFromCart(id);
    }

    const handleDecrease = (id) => {
        ItemDecrease(id);

    }

    const handleIncrease = (id) => {
        ItemIncrease(id);
    }

    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1), 0
    );

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6">
                <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

                {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">
                        Your cart is empty 🛍️
                    </p>
                ) : (
                    <>
                        <div className="space-y-4">
                            {cart.map((item, index) => (
                                <div
                                    key={item.id || item.product_id || index}
                                    className="flex justify-between items-center border-b pb-3 space-x-4"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <img
                                            src={item.product_imgage || "/placeholder.png"}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div>
                                            <h2 className="text-lg font-semibold">{item.name}</h2>
                                            <p className="text-gray-600">₹{item.price}</p>
                                            <p className="text-sm text-gray-500">
                                                Qty: {item.quantity || 1}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDecrease(item.id)}
                                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                -

                                            </button>

                                            <button
                                                onClick={() => handleIncrease(item.product_id)}
                                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                +
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 border-t pt-6 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                Total: ₹{totalPrice.toFixed(2)}
                            </h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={clearCart}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-xl text-gray-800"
                                >
                                    Clear Cart
                                </button>
                                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl text-white">
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CartPage;