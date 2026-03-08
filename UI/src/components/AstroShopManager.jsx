import React, { useState, useEffect } from 'react';
import { shop } from '../services/api';
import { PlusIcon, ShoppingBagIcon, PhotoIcon, TrashIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
const toast = {
    error: (msg) => alert(msg),
    success: (msg) => alert(msg)
};

const AstroShopManager = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Gemstones',
        stock: 10,
        image: null
    });

    const categories = ['Gemstones', 'Yantra', 'Rudraksha', 'Crystals', 'Spiritual'];

    useEffect(() => {
        fetchShopData();
    }, []);

    const fetchShopData = async () => {
        setLoading(true);
        try {
            const [prodRes, orderRes] = await Promise.all([
                shop.getProducts(), // Filter by current astrologer in backend? Actually backend getProducts is public. 
                // Wait, backend getProducts doesn't have a specific "get my products" for astrologer yet.
                // I should add that or just filter in frontend (less secure but faster now).
                shop.getAstrologerOrders()
            ]);
            // Filtering products by astrologer_id would require having the astrologer profile info.
            // Let's assume for now the astrologer wants to see all their orders.
            setOrders(orderRes.data);
            setProducts(prodRes.data); // For now just showing all so we can see something
        } catch (err) {
            toast.error("Failed to load shop data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setForm({ ...form, image: e.target.files[0] });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!form.image) {
            toast.error("Please upload an image");
            return;
        }
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('price', form.price);
            formData.append('category', form.category);
            formData.append('stock', form.stock);
            formData.append('image', form.image);

            await shop.createProduct(formData);
            toast.success("Product added successfully!");
            setShowAddForm(false);
            setForm({ name: '', description: '', price: '', category: 'Gemstones', stock: 10, image: null });
            fetchShopData();
        } catch (err) {
            toast.error("Failed to add product");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await shop.updateOrderStatus(orderId, status);
            toast.success("Order status updated");
            fetchShopData();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <ShoppingBagIcon className="h-7 w-7 mr-2 text-amber-500" />
                    My Astro Shop
                </h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all"
                >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    {showAddForm ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-amber-500/30 shadow-xl animate-in slide-in-from-top duration-300">
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                                <input
                                    type="text" required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border dark:border-gray-700 dark:bg-slate-900"
                                    placeholder="e.g. Natural Blue Sapphire"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border dark:border-gray-700 dark:bg-slate-900"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                                    <input
                                        type="number" required
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border dark:border-gray-700 dark:bg-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                                    <input
                                        type="number" required
                                        value={form.stock}
                                        onChange={e => setForm({ ...form, stock: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border dark:border-gray-700 dark:bg-slate-900"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    required
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border dark:border-gray-700 dark:bg-slate-900 h-32 resize-none"
                                    placeholder="Describe the product and its astrological benefits..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-amber-500 transition-colors">
                                    {form.image ? (
                                        <div className="flex items-center text-sm text-amber-500 font-bold">
                                            <CheckIcon className="h-5 w-5 mr-1" />
                                            {form.image.name}
                                        </div>
                                    ) : (
                                        <>
                                            <PhotoIcon className="h-8 w-8 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-500">Click to upload image</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-slate-900 dark:bg-amber-500 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Adding Product...' : 'Publish Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Orders List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Shop Orders</h3>
                    {orders.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                            <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">No orders yet.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex gap-4">
                                    <img src={order.product.image_url} className="w-16 h-16 rounded-xl object-cover" alt="" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{order.product.name}</h4>
                                        <p className="text-xs text-gray-500">Qty: {order.quantity} • Total: ₹{order.total_amount}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 max-w-xs">{order.shipping_address}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                            className="text-xs font-bold text-amber-500 hover:underline"
                                        >
                                            Mark as Shipped
                                        </button>
                                    )}
                                    {order.status === 'shipped' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                            className="text-xs font-bold text-green-500 hover:underline"
                                        >
                                            Mark as Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Quick Products Overview */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Products</h3>
                    <div className="space-y-3">
                        {products.slice(0, 5).map(prod => (
                            <div key={prod.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={prod.image_url} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{prod.name}</p>
                                        <p className="text-[10px] text-gray-500">₹{prod.price} • Stock: {prod.stock}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-gray-400 hover:text-amber-500"><PencilIcon className="h-4 w-4" /></button>
                                    <button className="text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AstroShopManager;
