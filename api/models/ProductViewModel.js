const mongoose = require("mongoose");

const ProductViewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        // We can use this to store "anonymous" sessions if needed, 
        // but for now we'll rely on user ID or IP if we were advanced (skipping IP for simple node setup)
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ProductView", ProductViewSchema);
