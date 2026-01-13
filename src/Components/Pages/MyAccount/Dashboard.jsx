"use client"

import { useState } from "react";
import { OrderDetailsModal } from "./ModalBox/OrderDetailsModal";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="text-4xl font-semibold text-gray-900 mb-2">{value}</div>
      <div className="text-sm font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

export default function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
  // Sample orders data - set to empty array to show empty state
  const recentOrders = [
   {
      id: "ORD-001",
      date: "January 8, 2025",
      status: "Delivered",
      statusColor: "green",
      amount: "$64.98",
      items: 4
    },
    {
      id: "ORD-002",
      date: "January 10, 2025",
      status: "Processing",
      statusColor: "orange",
      amount: "$49.50",
      items: 1
    },
    {
      id: "ORD-003",
      date: "January 12, 2025",
      status: "Awaiting Confirmation",
      statusColor: "yellow",
      amount: "$120.00",
      items: 2
    }
  ];

  // Change this to [] to test empty state
  // const recentOrders = [];

  const hasOrders = recentOrders.length > 0;

  // Calculate stats
  const deliveredCount = recentOrders.filter(o => o.status === "Delivered").length;
  const processingCount = recentOrders.filter(o => o.status === "Processing").length;
  const shippingCount = recentOrders.filter(o => o.status === "Shipping").length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8 max-w-10xl mx-auto">
        {/* Welcome Message */}
        <h1 className="text-2xl mb-8 mt-10 font-semibold text-gray-900">
          Welcome back, John!
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard 
            title="Loyalty Points"
            value={hasOrders ? 1250 : 0}
            subtitle={hasOrders ? "150 points this month" : "0 points this month"}
          />
          <StatCard 
            title="Recent Orders"
            value={recentOrders.length}
            subtitle={`${deliveredCount} delivered • ${processingCount} processing • ${shippingCount} shipping`}
          />
          <StatCard 
            title="Wishlist"
            value={hasOrders ? 8 : 0}
            subtitle="Items saved for later"
          />
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-xl p-8 ">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            {hasOrders && (
              <button className="text-md  text-black cursor-pointer  hover:underline decoration-gray-400">
                See All
              </button>
            )}
          </div>
          
          {hasOrders ? (
            /* Orders List */
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between py-4 border border-gray-200 p-4 rounded-xl"
                >
                  <div className="flex-1">
                    <div className="font-bold text-black mb-1">#{order.id}</div>
                    <div className="text-sm text-gray-500 mb-2">Placed on {order.date}</div>
                    <span 
                      className={`inline-block px-3 py-1 text-xs font-medium rounded ${
                        order.statusColor === 'green' 
                          ? 'bg-green-50 text-green-700' 
                          : order.statusColor === 'orange'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-gray-900 mb-1">
                      {order.amount}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      {order.items} {order.items === 1 ? 'Item' : 'Items'}
                    </div>
                    <button className="bg-gray-900 text-white cursor-pointer px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors"   onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}  >
                      More Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-64 h-64 mb-6  flex items-center justify-center">
               <img src="empty.svg" alt="" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Cart is Empty
              </h3>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                Looks like you haven't placed any orders yet.<br />
                Start exploring and find the perfect products for your pet!
              </p>
              <button className="bg-gray-900 text-white cursor-pointer px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Browse Products
              </button>
            </div>
          )}
        </div>
      </div>
        <OrderDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
    </div>
  );
}