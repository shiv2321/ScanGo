import api from "../api";
import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    const fetchCart = async () => {
        if (isLoggedIn) {
            try {
                const res = await api
                    .get("http://127.0.0.1:8000/api/getcart/", {
                        headers: { Authorization: `Token ${token}` },
                    })
                    
                    const items = res.data["cart items"] || [];
                    const flatItems = items.map((item) => ({
                        id: item.id,
                        product_id : item.product?.id,
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
            if (storedCart) {
                const parsed = JSON.parse(storedCart);
                const flatItems = parsed.map((item) => ({
                    id: item.id || Date.now(),
                    product_id: item.product_id || item.id,
                    name: item.name || "Product",
                    price: item.price || 0,
                    image: "/placholder.png",
                    quantity: item.quantity || 1,
                }));
                setCart(flatItems);
            }
        }
    }



    const addToCart = async (product) => {
        if (isLoggedIn) {
            try {
                const payload = product.id 
                    ? {product_id : product.id, quantity: 1}
                    : { qr_code : product.qr_code, quantity: 1}
                console.log("from add to cart func payload: ",payload);

                const res = await api.post("http://127.0.0.1:8000/api/addtocart/",
                    payload,
                    { headers: { Authorization: `Token ${token}` } }

                );
                await fetchCart();

            } catch (error) {
                console.error("Error adding to backend cart ", error);
            }

        } else {
            setCart((prev) => {
                const existing = prev.find((item) => item.id === product.id);
                let updated;
                if (existing) {
                    updated = prev.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {

                    updated = [
                        ...prev, {
                        id : Date.now(),
                        product_id : product.id,
                        name : product.name,
                        price : product.price,
                        quantity: 1,
                     },
                    ];
                }
                localStorage.setItem("cart", JSON.stringify(updated));
                return updated;
            });
        }

    };

    const removeFromCart = async (id) => {
        if (isLoggedIn) {
            try {
                await api.delete(`http://127.0.0.1:8000/api/deletecart/${id}`,
                   { headers: {Authorization: `Token ${token}` },
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
            await api.put(
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
        console.log("Request hit on IntemIncease")
        if (isLoggedIn){
            try {
                await api.put("http://127.0.0.1:8000/api/addtocart/",
                    { product_id: id}, 
                    {headers:{Authorization: `Token ${token}` },
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
                await api.delete("http://127.0.0.1:8000/api/deletecart/", {
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
    }, []);

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

