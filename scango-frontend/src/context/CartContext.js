import axios from "axios";
import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    const fetchCart = async () => {
        if (isLoggedIn) {
            try {
                const res = await axios
                    .get("http://127.0.0.1:8000/api/getcart/", {
                        headers: { Authorization: `Token ${token}` },
                    })
                    
                    const items = res.data["cart items"] || [];
                    const flatItems = items.map((item) => ({
                        id: item.id,
                        name: item.product?.name,
                        price: parseFloat(item.product?.price) || 0,
                        image: "/placeholder.png",
                        quantity: item.quantity || 1,
                    }));
                    setCart(flatItems);
        
            } catch(err) {
                console.error("Failed to load backend cart ", err) 
            }
        } else {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) setCart(JSON.parse(storedCart));
        }
    }



    const addToCart = async (product) => {
        if (isLoggedIn) {
            try {
                const res = await axios.post("http://127.0.0.1:8000/api/addtocart/",
                    { product_id: product.id, quantity: 1 },
                    { headers: { Authorization: `Token ${token}` } }

                );
                const newItem = res.data;
                const flatItems = {
                    id: newItem.id,
                    name: newItem.product?.name,
                    price: parseFloat(newItem.product?.price) || 0,
                    image: "/placeholder.png",
                    quantity: newItem.quantity || 1,
                }
                setCart((prev) => {
                    const existing = prev.find((item) => item.id === flatItems.id)
                    if (existing) {
                        return prev.map((item) =>
                            item.id === flatItems.id ? flatItems : item
                        );
                    } else {
                        return [...prev, flatItems]
                    }
                });
            } catch (error) {
                console.error("Error adding to backend cart ", error);
            }

        } else {
            setCart((prev) => {
                const existing = prev.find((item) => item.id === product.id);
                if (existing) {
                    return prev.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    return [...prev, { ...product, quantity: 1 }];
                }
            });
        }

    };

    const removeFromCart = async (id) => {
        if (isLoggedIn) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/deletecart/${id}/`, {
                    headers: {Authorization: `Token ${token}` },
                });
                await fetchCart();

            }catch (error) {
                console.error("Error removing cart item ",error)
            }
        } else {
            const updated = cart.filter((item) => item.id !== id);
            setCart(updated);
            localStorage.setItem("cart", JSON.stringify(updated));
        }
    };

    const ItemDecrease = async (cartItemId) => {
        if (isLoggedIn) {
            await axios.put(
                `http://127.0.0.1:8000/api/deletecart/${cartItemId}`,
                {},
                { headers: {Authorization: `Token ${token}`} }
            );

            await fetchCart();

        }else {
            const updated = cart.map((item) => 
            item.id === cartItemId
                ? { ...item, quantity:Math.max(1, item.quantity -1) }
                : item
            );
            setCart(updated);
            localStorage.setItem("cart", JSON.stringify(updated));
        }
    }

    const ItemIncrease = async (id) => {
        if (isLoggedIn){
            try {
                await axios.put(`http://127.0.0.1:8000:/api/addtocart/${id}/`,{}, {
                    headers:{Authorization: `Token ${token}` },
                });
                await fetchCart();
                
            }
            catch (err) {
                console.error("Error Increasing quantity: ",err);
            }
        } else {
            const updated = cart.map((item) => 
                item.id === id ? { ...item , quantity: item.quantity + 1 } : item
            );
            setCart(updated);
            localStorage.setItem("cart",JSON.stringify(updated));
        }
        

    };

    const clearCart = async () => {
        if (isLoggedIn) {
            try {
                await axios.delete("http://127.0.0.1:8000/api/deletecart/", {
                    headers : {Authorization: `Token ${token}` },
                });
                await fetchCart();
            } catch (err) {
                console.error("Error in Deleting cart: ",err)
            }
        } else {
            setCart([]);
            localStorage.setItem("cart")
        }
    };

    useEffect(() => {
        fetchCart();
    });

    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart, isLoggedIn, token]);
    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, clearCart, fetchCart, ItemDecrease, ItemIncrease }}
        >
            {children}
        </CartContext.Provider>
    );
};

