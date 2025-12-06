const Product = require("../models/ProductModel");
const Order = require("../models/OrderModel");
const ProductView = require("../models/ProductViewModel");
const User = require("../models/UserModel");

// @desc    Get smart product recommendations
// @route   GET /api/recommendations
// @access  Public (Personalized if logged in)
exports.getRecommendations = async (req, res) => {
    try {
        let recommendations = [];

        // 1. Personalized: Based on user's recent views (Collaborative filtering style simplified)
        if (req.user) {
            // Get last 5 viewed products
            const recentViews = await ProductView.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("product");

            if (recentViews.length > 0) {
                // Find products in same categories as recent views
                const categories = recentViews.map(view => view.product.category);
                const viewedIds = recentViews.map(view => view.product._id);

                const similarProducts = await Product.find({
                    category: { $in: categories },
                    _id: { $nin: viewedIds }, // Exclude already viewed
                    isActive: true
                })
                    .sort({ averageRating: -1 }) // Sort by rating ("Verified/Trusted" heuristic)
                    .limit(5);

                recommendations.push(...similarProducts);
            }
        }

        // 2. Popular/Trending: Most ordered items
        // If not enough personal recs, fill with popular items
        if (recommendations.length < 8) {
            const topOrders = await Order.aggregate([
                { $unwind: "$items" },
                { $group: { _id: "$items.product", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            const topProductIds = topOrders.map(order => order._id);

            const popularProducts = await Product.find({
                _id: { $in: topProductIds, $nin: recommendations.map(r => r._id) },
                isActive: true
            }).populate("farmer", "name").populate("category", "name");

            recommendations.push(...popularProducts);
        }

        // 3. Fallback: Just Random/Recent High Rated
        if (recommendations.length < 4) {
            const fallback = await Product.find({
                isActive: true,
                _id: { $nin: recommendations.map(r => r._id) }
            })
                .sort({ averageRating: -1 })
                .limit(5)
                .populate("farmer", "name").populate("category", "name");

            recommendations.push(...fallback);
        }

        // Unique filter just in case
        recommendations = recommendations.filter((v, i, a) => a.findIndex(v2 => (v2._id.toString() === v._id.toString())) === i);

        res.json({
            success: true,
            count: recommendations.length,
            data: recommendations.slice(0, 8)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Get price suggestion for farmer
// @route   GET /api/recommendations/price-suggestion
// @access  Public
exports.getPriceSuggestion = async (req, res) => {
    try {
        const { name, category } = req.query;

        // Logic: Search for products with similar name/category
        // Then check their historic prices
        // Or check Orders for "real" sold price

        if (!name && !category) {
            return res.status(400).json({ success: false, message: "Name or Category required" });
        }

        const query = { isActive: true };
        if (category) query.category = category;
        if (name) query.name = { $regex: name, $options: "i" };

        // 1. Fetch live competitors prices
        const competitorProducts = await Product.find(query).select("price unit");

        if (competitorProducts.length === 0) {
            return res.json({
                success: true,
                suggestion: null,
                message: "No enough data for price suggestion."
            });
        }

        const prices = competitorProducts.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

        res.json({
            success: true,
            data: {
                min,
                max,
                avg: Math.round(avg),
                suggestedRange: `${Math.floor(avg * 0.9)} - ${Math.ceil(avg * 1.1)}`
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
