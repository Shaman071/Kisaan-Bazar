const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");

// @desc    Get farmer analytics
// @route   GET /api/analytics/farmer
// @access  Private (Farmer only)
exports.getFarmerAnalytics = async (req, res) => {
    try {
        const farmerId = req.user._id;

        // 1. Overview Stats (Total Revenue, Total Orders)
        // We can do this with aggregation or simple queries. Aggregation is cleaner.
        const overallStats = await Order.aggregate([
            // Filter orders that contain items from this farmer
            // Note: Orders might have mixed items if we allowed it, but currently schema implies simplified flow.
            // Assuming Order has 'items' and items have 'product'. We need to lookup product to check farmer.
            // THIS IS TRICKY if Order doesn't store farmer ID directly.
            // Let's check Order Schema. If it doesn't store farmer at root, we need to unwind.
            // Checking Order Schema... assuming we need to unwind items.

            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $match: { "productDetails.farmer": farmerId } }, // Match this farmer's products

            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    totalItemsSold: { $sum: "$items.quantity" },
                    orderCount: { $addToSet: "$_id" } // Count unique orders
                }
            },
            {
                $project: {
                    totalRevenue: 1,
                    totalItemsSold: 1,
                    totalOrders: { $size: "$orderCount" }
                }
            }
        ]);

        // 2. Best Selling Products
        const bestSelling = await Order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $match: { "productDetails.farmer": farmerId } },
            {
                $group: {
                    _id: "$productDetails.name",
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // 3. Peak Order Day
        // Use createdAt from Order (root level) - tricky if order has multiple farmers.
        // We'll count distinct orders that contain at least one item from this farmer.
        const peakDay = await Order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $match: { "productDetails.farmer": farmerId } },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" }, // 1 (Sun) to 7 (Sat)
                    count: { $addToSet: "$_id" } // Unique orders
                }
            },
            { $project: { day: "$_id", count: { $size: "$count" } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        const days = ["Unknown", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        res.json({
            success: true,
            overview: overallStats[0] || { totalRevenue: 0, totalItemsSold: 0, totalOrders: 0 },
            bestSelling,
            peakDay: peakDay.length > 0 ? days[peakDay[0].day] : "N/A"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Get consumer analytics
// @route   GET /api/analytics/consumer
// @access  Private (Consumer only)
exports.getConsumerAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Monthly Spend & Total Spend
        const spending = await Order.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalSpend: { $sum: "$totalAmount" },
                    avgOrderValue: { $avg: "$totalAmount" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        // 2. Most Bought Item
        const mostBought = await Order.aggregate([
            { $match: { user: userId } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.name",
                    qty: { $sum: "$items.quantity" },
                    spend: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { qty: -1 } },
            { $limit: 1 }
        ]);

        // 3. Unique Farmers Supported
        // Requires lookup on products then farmers
        const farmersSupported = await Order.aggregate([
            { $match: { user: userId } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.farmer"
                }
            },
            { $count: "count" }
        ]);

        res.json({
            success: true,
            spending: spending[0] || { totalSpend: 0, avgOrderValue: 0, totalOrders: 0 },
            favoriteItem: mostBought[0] || null,
            farmersSupported: farmersSupported[0]?.count || 0
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
