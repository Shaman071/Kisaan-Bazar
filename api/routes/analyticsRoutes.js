const express = require("express");
const { getFarmerAnalytics, getConsumerAnalytics } = require("../controllers/analyticsController");
const { verifyToken, isFarmer } = require("../utils/authMiddleware");

const router = express.Router();

router.get("/farmer", verifyToken, isFarmer, getFarmerAnalytics);
router.get("/consumer", verifyToken, getConsumerAnalytics);

module.exports = router;
