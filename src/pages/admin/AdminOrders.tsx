import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from '../../context/AuthContext';
import { projectId } from "../../utils/supabase/info";
import { toast } from "sonner";
import AdminLayout from "../../components/admin/AdminLayout";
import { Package, Truck, CreditCard, ChevronDown, ChevronUp, FileDown, Search } from "lucide-react";
import { generateInvoice } from "../../utils/generateInvoice";

export default function AdminOrders() {
    const { accessToken } = useContext(AuthContext);

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/orders`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const data = await response.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Fetch orders error:", error);
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
        try {
            const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/orders/${orderId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                    body: JSON.stringify({ status, paymentStatus }),
                }
            );
            if (response.ok) {
                toast.success("Order updated successfully");
                fetchOrders();
            } else toast.error("Failed to update order");
        } catch (error) {
            console.error("Update order error:", error);
            toast.error("Failed to update order");
        }
    };

    const toggleOrderExpand = (orderId: string) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) newSet.delete(orderId);
            else newSet.add(orderId);
            return newSet;
        });
    };

    // Filter Orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress?.phone?.includes(searchTerm) ||
            order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    return (
        <AdminLayout title="Manage Orders">

            {/* Top Controls */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-4">
                {/* Search */}
                <div className="relative w-full md:w-1/3">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Search className="w-5 h-5" /></span>
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, Phone, Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none shadow-sm placeholder:text-slate-400 transition"
                    />
                </div>

                {/* Delivery Status Filter */}
                <div className="w-full md:w-1/6">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none shadow-sm transition bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Payment Status Filter */}
                <div className="w-full md:w-1/6">
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none shadow-sm transition bg-white"
                    >
                        <option value="all">All Payments</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="h-10 w-10 border-b-2 border-teal-600 rounded-full animate-spin" />
                </div>
            ) : filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {filteredOrders.map(order => {
                        const isExpanded = expandedOrders.has(order.id);

                        return (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">

                                {/* Header */}
                                <div
                                    className="bg-white p-4 md:p-6 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    onClick={() => toggleOrderExpand(order.id)}
                                >
                                    {/* Left: Order Info */}
                                    <div className="flex items-start md:items-center gap-4">
                                        {/* Icon */}
                                        <div className="bg-teal-50 p-3 rounded-2xl text-teal-600 flex items-center justify-center shadow-sm">
                                            <Package className="w-6 h-6" />
                                        </div>

                                        {/* Order Details */}
                                        <div className="min-w-0">
                                            <h3 className="text-lg md:text-xl font-semibold text-slate-900 flex flex-wrap items-center gap-2">
                                                <span className="truncate">Order #{order.id.slice(0, 8)}...</span>

                                                {/* Delivery Status Badge */}
                                                <span
                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full border shadow-sm ${order.status === 'delivered'
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : order.status === 'cancelled'
                                                            ? 'bg-red-100 text-red-700 border-red-200'
                                                            : 'bg-blue-100 text-blue-700 border-blue-200'
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>

                                                {/* Payment Status Badge */}
                                                <span
                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full border shadow-sm ${order.paymentStatus === 'completed'
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : order.paymentStatus === 'failed'
                                                            ? 'bg-red-100 text-red-700 border-red-200'
                                                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                        }`}
                                                >
                                                    {order.paymentStatus || 'pending'}
                                                </span>
                                            </h3>

                                            {/* Customer Name & Date */}
                                            <p className="text-slate-500 text-sm mt-1 md:mt-0 truncate">
                                                {order.shippingAddress?.fullName} • {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Total & Expand */}
                                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                                        {/* Total Amount */}
                                        <div className="text-right">
                                            <p className="text-xl md:text-2xl font-bold text-teal-600">₹{order.total?.toFixed(0)}</p>
                                            <p className="text-xs text-slate-400">{order.items?.length || 0} items</p>
                                        </div>

                                        {/* Expand/Collapse Icon */}
                                        <div className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>


                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="p-6 animate-fadeIn space-y-6">
                                        {/* Customer & Shipping */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span> Customer Details
                                                </h4>
                                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                                    <p className="text-slate-900 font-medium text-lg">{order.shippingAddress?.fullName}</p>
                                                    <p className="text-slate-600 mt-1">{order.shippingAddress?.phone}</p>
                                                    <p className="text-slate-500 text-sm mt-2">{order.userEmail}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                                                    <Truck className="w-4 h-4 text-slate-400" /> Shipping Address
                                                </h4>
                                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                                    <p className="text-slate-700 leading-relaxed">{order.shippingAddress?.address}, {order.shippingAddress?.city}<br />{order.shippingAddress?.state} - <span className="font-mono">{order.shippingAddress?.zipCode}</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span> Items ({order.items?.length || 0})
                                            </h4>
                                            <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden divide-y divide-slate-100">
                                                {order.items?.map((item: any, idx: number) => {
                                                    const displayImage = item.customImage || item.image || '';
                                                    const isCustom = !!item.customImage || item.productName?.includes('Custom Print');
                                                    return (
                                                        <div key={idx} className="p-4 flex items-center gap-4">
                                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 relative">
                                                                {displayImage ? <img src={displayImage} alt={item.productName} className="w-full h-full object-cover" /> :
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>}
                                                                {isCustom && <span className="absolute top-1 left-1 bg-teal-500 text-white text-[8px] px-1 py-0.5 rounded font-semibold">Custom</span>}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-slate-900 font-medium truncate">{item.productName}</p>
                                                                <p className="text-slate-500 text-sm">{item.color && `${item.color} • `}{item.size} • Qty: {item.quantity}</p>
                                                                {item.customArtStyle && <p className="text-xs text-teal-600">Style: {item.customArtStyle}</p>}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-slate-900 font-semibold">₹{(item.price * item.quantity).toFixed(0)}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Status Controls & Invoice */}
                                        <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="flex-1">
                                                <label className="block text-slate-700 mb-2 font-semibold text-sm flex items-center gap-2"><Truck className="w-4 h-4 text-teal-600" /> Delivery Status</label>
                                                <select
                                                    value={order.status}
                                                    onChange={e => { e.stopPropagation(); updateOrderStatus(order.id, e.target.value); }}
                                                    onClick={e => e.stopPropagation()}
                                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-slate-700 mb-2 font-semibold text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-purple-600" /> Payment Status</label>
                                                <select
                                                    value={order.paymentStatus}
                                                    onChange={e => { e.stopPropagation(); updateOrderStatus(order.id, order.status, e.target.value); }}
                                                    onClick={e => e.stopPropagation()}
                                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="failed">Failed</option>
                                                </select>
                                            </div>
                                            <div className="flex justify-end mt-2 sm:mt-0">
                                                <button onClick={e => { e.stopPropagation(); generateInvoice(order); }} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium text-sm">
                                                    <FileDown className="w-4 h-4" /> Download Invoice
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Orders Found</h3>
                    <p className="text-slate-500">New orders will appear here.</p>
                </div>
            )}

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
        </AdminLayout>
    );
}
