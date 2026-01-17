import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { features, wallet } from '../services/api';
import {
  ShoppingBagIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';

const AstroShop = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [shopRes, walletRes] = await Promise.all([
          features.getShopItems(),
          wallet.getBalance().catch(() => null),
        ]);
        setItems(shopRes.data || []);
        if (walletRes && walletRes.data) {
          setWalletBalance(walletRes.data.balance);
        }
      } catch (e) {
        console.error('Failed to load shop', e);
      }
    };
    const savedCart = localStorage.getItem('astroShopCart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      } catch (e) {
        localStorage.removeItem('astroShopCart');
      }
    }
    load();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('astroShopCart', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('astroShopCartUpdated'));
    } catch (e) {
    }
  }, [cartItems]);

  const handleSelectProduct = (item) => {
    setSelectedProduct(item);
  };

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setMessage('');
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((c) =>
          c.id === id ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((c) => c.id !== id));
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    try {
      setCheckingOut(true);
      setMessage('');
      for (const item of cartItems) {
        await features.purchaseProduct(item.id, item.quantity);
      }
      setCartItems([]);
      try {
        const walletRes = await wallet.getBalance();
        if (walletRes && walletRes.data) {
          setWalletBalance(walletRes.data.balance);
        }
      } catch (e) {
        console.error('Failed to refresh wallet', e);
      }
      setMessage('Order placed successfully');
    } catch (error) {
      console.error('Checkout failed', error);
      setMessage(
        error?.response?.data?.detail || 'Checkout failed. Please check balance.'
      );
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingBagIcon className="h-8 w-8 text-amber-500" />
              Astro Shop
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore spiritual products curated by astrologers.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold mb-2">Products</h2>
              {walletBalance !== null && (
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                  Wallet: ₹{walletBalance.toFixed(2)}
                </div>
              )}
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-gray-500">No products available.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition"
                    onClick={() => handleSelectProduct(item)}
                  >
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 w-full relative overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <ShoppingBagIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {item.description || item.category || 'Astro product'}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                          ₹{item.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-amber-500 hover:text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingBagIcon className="h-5 w-5 text-amber-500" />
                Cart
              </h2>
              <span className="text-xs text-gray-500">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex-1 space-y-3 max-h-64 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-sm text-gray-500">Cart is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        ₹{item.price} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded bg-gray-100 dark:bg-gray-700"
                      >
                        <MinusIcon className="h-3 w-3" />
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded bg-gray-100 dark:bg-gray-700"
                      >
                        <PlusIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded bg-red-100 text-red-600 dark:bg-red-900/40"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span>Total</span>
                <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
              </div>
              {message && (
                <p className="text-xs text-amber-500 mb-2 break-words">{message}</p>
              )}
              <button
                onClick={handleCheckout}
                disabled={checkingOut || cartItems.length === 0}
                className="w-full py-2 text-sm font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checkingOut ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>

        {/* Product details sidebar */}
        {selectedProduct && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <div
              className="flex-1 bg-black/40"
              onClick={() => setSelectedProduct(null)}
            />
            <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-xl border-l border-gray-200 dark:border-gray-700 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Product Details</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="h-52 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingBagIcon className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto">
                <h3 className="text-lg font-bold">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedProduct.category || 'Astro product'}
                </p>
                <p className="text-2xl font-semibold text-amber-600">
                  ₹{selectedProduct.price}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">
                  {selectedProduct.description ||
                    'Spiritual product recommended by astrologers.'}
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => addToCart(selectedProduct)}
                  className="w-full py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AstroShop;
