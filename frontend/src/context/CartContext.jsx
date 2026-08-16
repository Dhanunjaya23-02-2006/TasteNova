import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser._id) {
                    const savedCart = localStorage.getItem(`tastenova_cart_${parsedUser._id}`);
                    if (savedCart) {
                        return JSON.parse(savedCart);
                    }
                }
            } catch (e) {
                console.error('Error parsing cart from storage', e);
            }
        }
        return [];
    });

    // Clear cart if user logs out
    useEffect(() => {
        if (!user) {
            setCartItems([]);
        }
    }, [user]);

    // Save cart to local storage whenever cartItems change, but only for logged-in user
    useEffect(() => {
        if (user && user._id) {
            localStorage.setItem(`tastenova_cart_${user._id}`, JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const addToCart = (item) => {
        setCartItems(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(i => i._id !== id));
    };

    const updateQuantity = (id, change) => {
        setCartItems(prev => prev.map(item => {
            if (item._id === id) {
                const newQty = item.qty + change;
                return newQty > 0 ? { ...item, qty: newQty } : null; // nulls will be filtered out below
            }
            return item;
        }).filter(Boolean)); // remove items that dropped to 0 quantity
    };

    const clearCart = () => setCartItems([]);

    const replaceCart = (items) => setCartItems(items);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, replaceCart }}>
            {children}
        </CartContext.Provider>
    );
};
