"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "../redux/slices/cartSlice";
import { createOrder } from "../redux/slices/orderSlice";
import { FaArrowLeft, FaLeaf, FaTrash } from "react-icons/fa";
import Loader from "../components/Loader";
import { placeholder } from "../assets";
import { useTranslation } from "react-i18next";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const [orderType, setOrderType] = useState("pickup");
  const [orderDetails, setOrderDetails] = useState({
    pickupDetails: {
      date: "",
      time: "",
      location: "",
    },
    deliveryDetails: {
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
      },
      date: "",
      time: "",
    },
    paymentMethod: "cash",
    notes: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, farmerId, farmerName } = useSelector(
    (state) => state.cart
  );
  const { user } = useSelector((state) => state.auth);
  const { loading, success, order } = useSelector((state) => state.orders);

  useEffect(() => {
    if (success && order) {
      navigate(`/orders/${order._id}`);
    }
  }, [success, order, navigate]);

  useEffect(() => {
    if (user && user.address) {
      setOrderDetails((prev) => ({
        ...prev,
        deliveryDetails: {
          ...prev.deliveryDetails,
          address: {
            street: user.address.street || "",
            city: user.address.city || "",
            state: user.address.state || "",
            zipCode: user.address.zipCode || "",
          },
        },
      }));
    }
  }, [user]);

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleQuantityChange = (productId, quantity) => {
    dispatch(updateCartQuantity({ productId, quantity }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child, grandchild] = name.split(".");

      if (grandchild) {
        setOrderDetails({
          ...orderDetails,
          [parent]: {
            ...orderDetails[parent],
            [child]: {
              ...orderDetails[parent][child],
              [grandchild]: value,
            },
          },
        });
      } else {
        setOrderDetails({
          ...orderDetails,
          [parent]: {
            ...orderDetails[parent],
            [child]: value,
          },
        });
      }
    } else {
      setOrderDetails({
        ...orderDetails,
        [name]: value,
      });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      return;
    }

    const orderData = {
      farmer: farmerId,
      items: cartItems.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      notes: orderDetails.notes,
    };

    if (orderType === "pickup") {
      orderData.pickupDetails = orderDetails.pickupDetails;
    } else {
      orderData.deliveryDetails = orderDetails.deliveryDetails;
    }

    orderData.paymentMethod = orderDetails.paymentMethod;
    dispatch(createOrder(orderData));
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholder;
  };

  if (loading) {
    return <Loader />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <FaLeaf className="text-green-500 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">{t('checkout.empty_cart', 'Your Cart is Empty')}</h2>
        <p className="text-gray-600 mb-6">
          {t('checkout.empty_cart_desc', "Looks like you haven't added any products to your cart yet.")}
        </p>
        <button
          onClick={() => navigate("/products")}
          className="btn btn-primary"
        >
          {t('checkout.browse_products', 'Browse Products')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-green-500 hover:text-green-700 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        {t('checkout.continue_shopping', 'Continue Shopping')}
      </button>

      <h1 className="text-3xl font-bold mb-8">{t('checkout.title', 'Checkout')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('checkout.your_cart', 'Your Cart')}</h2>

            <div className="mb-4">
              <div className="flex items-center text-gray-600 mb-2">
                <FaLeaf className="text-green-500 mr-2" />
                <span>{t('checkout.ordering_from', 'Ordering from')}: {farmerName}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-gray-200"
                >
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={handleImageError}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div>
                          <img
                            src={placeholder}
                            alt="placeholder"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="mr-4">
                      <label
                        htmlFor={`quantity-${item.productId}`}
                        className="sr-only"
                      >
                        {t('products.quantity', 'Quantity')}
                      </label>
                      <input
                        type="number"
                        id={`quantity-${item.productId}`}
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.productId,
                            Number.parseInt(e.target.value)
                          )
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md pl-3"
                      />
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center mt-1"
                      >
                        <FaTrash className="mr-1" />
                        <span>{t('checkout.remove', 'Remove')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => dispatch(clearCart())}
                className="text-red-500 hover:text-red-700"
              >
                {t('checkout.clear_cart', 'Clear Cart')}
              </button>
              <div className="text-xl font-bold">
                {t('orders.total', 'Total')}: ₹{calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('checkout.order_details', 'Order Details')}</h2>

            <form onSubmit={handleSubmitOrder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('checkout.order_type', 'Order Type')}
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="orderType"
                      value="pickup"
                      checked={orderType === "pickup"}
                      onChange={() => setOrderType("pickup")}
                      className="mr-2 pl-3"
                    />
                    {t('checkout.pickup', 'Pickup')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="orderType"
                      value="delivery"
                      checked={orderType === "delivery"}
                      onChange={() => setOrderType("delivery")}
                      className="mr-2 pl-3"
                    />
                    {t('checkout.delivery', 'Delivery')}
                  </label>
                </div>
              </div>

              {orderType === "pickup" ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="pickupDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t('checkout.pickup_date', 'Pickup Date')}
                    </label>
                    <input
                      type="date"
                      id="pickupDate"
                      name="pickupDetails.date"
                      value={orderDetails.pickupDetails.date}
                      onChange={handleInputChange}
                      className="form-input pl-3"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pickupTime"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t('checkout.pickup_time', 'Pickup Time')}
                    </label>
                    <input
                      type="time"
                      id="pickupTime"
                      name="pickupDetails.time"
                      value={orderDetails.pickupDetails.time}
                      onChange={handleInputChange}
                      className="form-input pl-3"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pickupLocation"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t('checkout.pickup_location', 'Pickup Location')}
                    </label>
                    <input
                      type="text"
                      id="pickupLocation"
                      name="pickupDetails.location"
                      value={orderDetails.pickupDetails.location}
                      onChange={handleInputChange}
                      className="form-input pl-3"
                      placeholder={t('checkout.farm_address_placeholder', 'Farm address or specific pickup point')}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.delivery_address', 'Delivery Address')}
                    </label>
                    <input
                      type="text"
                      name="deliveryDetails.address.street"
                      value={orderDetails.deliveryDetails.address.street}
                      onChange={handleInputChange}
                      className="form-input mb-2 pl-3"
                      placeholder={t('checkout.street_placeholder', 'Street address')}
                      required
                    />

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        name="deliveryDetails.address.city"
                        value={orderDetails.deliveryDetails.address.city}
                        onChange={handleInputChange}
                        className="form-input pl-3"
                        placeholder={t('checkout.city_placeholder', 'City')}
                        required
                      />
                      <input
                        type="text"
                        name="deliveryDetails.address.state"
                        value={orderDetails.deliveryDetails.address.state}
                        onChange={handleInputChange}
                        className="form-input pl-3"
                        placeholder={t('checkout.state_placeholder', 'State')}
                        required
                      />
                    </div>

                    <input
                      type="text"
                      name="deliveryDetails.address.zipCode"
                      value={orderDetails.deliveryDetails.address.zipCode}
                      onChange={handleInputChange}
                      className="form-input pl-3"
                      placeholder={t('checkout.zip_placeholder', 'ZIP / Postal code')}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="deliveryDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t('checkout.delivery_date', 'Delivery Date')}
                    </label>
                    <input
                      type="date"
                      id="deliveryDate"
                      name="deliveryDetails.date"
                      value={orderDetails.deliveryDetails.date}
                      onChange={handleInputChange}
                      className="form-input pl-3"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="deliveryTime"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t('checkout.delivery_time', 'Delivery Time')}
                    </label>
                    <input
                      type="time"
                      id="deliveryTime"
                      name="deliveryDetails.time"
                      value={orderDetails.deliveryDetails.time}
                      onChange={handleInputChange}
                      className="form-input pl-3"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t('checkout.payment_method', 'Payment Method')}
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={orderDetails.paymentMethod}
                  onChange={handleInputChange}
                  className="form-input pl-3"
                  required
                >
                  <option value="cash">{t('checkout.cash_on_delivery', 'Cash on Pickup/Delivery')}</option>
                  <option value="bank_transfer">{t('checkout.bank_transfer', 'Bank Transfer')}</option>
                  <option value="other">{t('checkout.other', 'Other')}</option>
                </select>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t('checkout.order_notes', 'Order Notes (Optional)')}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={orderDetails.notes}
                  onChange={handleInputChange}
                  className="form-input pl-3"
                  placeholder={t('checkout.notes_placeholder', 'Any special instructions or requests...')}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-6"
                disabled={loading}
              >
                {loading ? t('checkout.processing', 'Processing...') : t('checkout.place_order', 'Place Order')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
