import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { shop, wallet } from '../services/api';
import { ShoppingBagIcon, SparklesIcon, FireIcon, ShieldCheckIcon, CreditCardIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
const toast = {
    error: (msg) => alert(msg),
    success: (msg) => alert(msg)
};

const CartModal = ({ isOpen, onClose, product, onPurchase }) => {
    const [address, setAddress] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !product) return null;

    const total = product.price * quantity;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!address) {
            toast.error('Please enter shipping address');
            return;
        }
        setLoading(true);
        try {
            await onPurchase(product.id, quantity, address);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-transparent">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <ShoppingBagIcon className="h-6 w-6 mr-2 text-amber-500" />
                        Complete Purchase
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex gap-4 mb-6">
                        <img src={product.image_url} alt={product.name} className="w-20 h-20 rounded-xl object-cover shadow-md" />
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{product.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Price: ₹{product.price}</p>
                            <div className="flex items-center mt-2">
                                <label className="text-sm mr-2 text-gray-600 dark:text-gray-400">Qty:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.stock}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 dark:bg-slate-700 text-center text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1 text-amber-500" />
                                Shipping Address
                            </label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-amber-500 outline-none h-24 resize-none transition-all"
                                placeholder="Enter your full shipping address..."
                                required
                            />
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl">
                            <div className="flex justify-between text-sm text-amber-800 dark:text-amber-200 mb-1">
                                <span>Subtotal</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-amber-900 dark:text-amber-100">
                                <span>Total Payable</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CreditCardIcon className="h-5 w-5" />
                                    Pay Now with Wallet
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ProductCard = ({ product, onBuy }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all group">
        <div className="relative h-56 overflow-hidden">
            <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-amber-600 text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                    {product.category}
                </span>
            </div>
            {product.stock <= 5 && (
                <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 rounded-md bg-red-500 text-white text-[10px] font-bold animate-pulse">
                        LOW STOCK
                    </span>
                </div>
            )}
        </div>
        <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-4">{product.description}</p>

            <div className="flex items-center justify-between">
                <div>
                    <span className="text-2xl font-black text-amber-600">₹{product.price}</span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Inclusive of taxes</p>
                </div>
                <button
                    onClick={() => onBuy(product)}
                    className="p-3 rounded-xl bg-slate-900 dark:bg-slate-700 text-white hover:bg-amber-500 dark:hover:bg-amber-500 transition-colors shadow-lg"
                >
                    <ShoppingBagIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    </div>
);

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [balance, setBalance] = useState(0);

    const categories = ['All', 'Gemstones', 'Yantra', 'Rudraksha', 'Crystals', 'Spiritual'];

    useEffect(() => {
        fetchProducts();
        fetchBalance();
    }, [selectedCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const cat = selectedCategory === 'All' ? undefined : selectedCategory;
            const res = await shop.getProducts(cat);
            setProducts(res.data);
        } catch (err) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchBalance = async () => {
        try {
            const res = await wallet.getBalance();
            setBalance(res.data.balance);
        } catch (err) { }
    };

    const handleBuy = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handlePurchase = async (productId, quantity, shippingAddress) => {
        try {
            await shop.createOrder({ product_id: productId, quantity, shipping_address: shippingAddress });
            toast.success('Order placed successfully!');
            fetchProducts();
            fetchBalance();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Transaction failed');
            throw err;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300 pb-20">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Header */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-amber-900 p-8 md:p-12 mb-12 shadow-2xl border border-white/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20" />

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold mb-6 border border-amber-500/30 backdrop-blur-md">
                            <SparklesIcon className="h-5 w-5 mr-2" />
                            AstroVeda Exclusive Shop
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                            Divine Energy in <span className="text-amber-500">Every Product</span>
                        </h1>
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                            Handpicked gemstones, energized yantras, and spiritual tools curated by our expert astrologers to enhance your life.
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center text-white/80">
                                <ShieldCheckIcon className="h-6 w-6 mr-2 text-green-400" />
                                <span className="text-sm font-semibold">100% Authentic</span>
                            </div>
                            <div className="flex items-center text-white/80">
                                <FireIcon className="h-6 w-6 mr-2 text-orange-500" />
                                <span className="text-sm font-semibold">Energized Items</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mr-3 shadow-lg">
                            <CreditCardIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-amber-500 uppercase">Wallet Balance</p>
                            <p className="text-xl font-black text-white">₹{balance.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto pb-6 gap-3 no-scrollbar mb-8">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap shadow-sm ${selectedCategory === cat
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 translate-y-[-2px]'
                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:border-amber-500/50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-96 animate-pulse border border-gray-100 dark:border-gray-700" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No items found</h3>
                        <p className="text-gray-500">Check back later for new arrivals in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} onBuy={handleBuy} />
                        ))}
                    </div>
                )}
            </main>

            <CartModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                onPurchase={handlePurchase}
            />
        </div>
    );
};

export default Shop;
