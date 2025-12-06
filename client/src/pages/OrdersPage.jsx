"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getConsumerOrders } from "../redux/slices/orderSlice";
import OrderItem from "../components/OrderItem";
import Loader from "../components/Loader";
import { FaShoppingBasket } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const OrdersPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Safe defaults so orders is never undefined
  const { orders = [], loading } = useSelector(
    (state) => state.orders || {}
  );

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dispatch(getConsumerOrders());
  }, [dispatch]);

  // Always work with an array
  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders =
    filter === "all"
      ? safeOrders
      : safeOrders.filter((order) => order.status === filter);

  if (loading) {
    return <Loader />;
  }

  const filters = [
    { key: 'all', label: t('orders.all', 'All') },
    { key: 'pending', label: t('orders.pending', 'Pending') },
    { key: 'accepted', label: t('orders.accepted', 'Accepted') },
    { key: 'out_for_delivery', label: t('orders.out_for_delivery', 'Out for Delivery') },
    { key: 'delivered', label: t('orders.delivered', 'Delivered') },
    { key: 'rejected', label: t('orders.rejected', 'Rejected') },
    { key: 'cancelled', label: t('orders.cancelled', 'Cancelled') },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('orders.title', 'My Orders')}</h1>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg ${filter === f.key
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-colors`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderItem key={order._id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass rounded-xl">
          <FaShoppingBasket className="text-green-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('orders.no_orders', 'No Orders Found')}</h3>
          <p className="text-gray-600">
            {filter === "all"
              ? t('orders.no_orders_yet', "You haven't placed any orders yet.")
              : t('orders.no_orders_filter', `You don't have any {{status}} orders.`, { status: filter })}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
