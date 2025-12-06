import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const OrderItem = ({ order }) => {
  const { t } = useTranslation();

  // Function to get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge-blue";
      case "accepted":
        return "badge-green";
      case "rejected":
        return "badge-red";
      case "completed":
        return "badge-green";
      case "cancelled":
        return "badge-red";
      default:
        return "badge-blue";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  console.log(order);

  return (
    <div className="card p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="mb-2 md:mb-0">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-sm">{t('orders.order_id', 'Order ID')}:</span>
            <span className="font-medium">{order._id.substring(0, 8)}...</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-500 text-sm">{t('orders.date', 'Date')}:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="mb-2 md:mb-0">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-sm">{t('orders.items_count', 'Items')}:</span>
            <span>{order.items.length}</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-500 text-sm">{t('orders.total', 'Total')}:</span>
            <span className="font-bold text-green-600">
              ₹{order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mb-2 md:mb-0">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-sm">{t('orders.status', 'Status')}:</span>
            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
              {t(`orders.${order.status}`, order.status)}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-500 text-sm">{t('orders.customer', 'Customer')}:</span>
            <span>{order.consumer.name}</span>
          </div>
        </div>

        <Link
          to={`/orders/${order._id}`}
          className="btn btn-outline flex items-center justify-center space-x-2 mt-2 md:mt-0"
        >
          <FaEye />
          <span>{t('orders.view_details', 'View Details')}</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderItem;
