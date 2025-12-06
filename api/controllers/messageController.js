const Message = require("../models/MessageModel");
const User = require("../models/UserModel");

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content, relatedOrder } = req.body;

    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res
        .status(404)
        .json({ success: false, message: "Receiver not found" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      relatedOrder,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .sort("createdAt")
      .populate("sender", "name role")
      .populate("receiver", "name role");

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/messages
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort("-createdAt")
      .populate("sender", "name role")
      .populate("receiver", "name role");

    const conversations = {};

    messages.forEach((message) => {
      const otherUser =
        message.sender._id.toString() === req.user._id.toString()
          ? message.receiver
          : message.sender;

      const conversationId = otherUser._id.toString();

      if (!conversations[conversationId]) {
        conversations[conversationId] = {
          user: {
            _id: otherUser._id,
            name: otherUser.name,
            role: otherUser.role,
          },
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
          },
          unreadCount:
            message.receiver._id.toString() === req.user._id.toString() &&
              !message.isRead
              ? 1
              : 0,
        };
      } else if (
        message.receiver._id.toString() === req.user._id.toString() &&
        !message.isRead
      ) {
        conversations[conversationId].unreadCount += 1;
      }
    });

    res.json({
      success: true,
      count: Object.keys(conversations).length,
      data: Object.values(conversations),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
// @desc    Get AI Assistant response
// @route   POST /api/messages/assistant
// @access  Public
exports.getAiResponse = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: "Question required" });

    const q = question.toLowerCase();
    let answer = "I'm sorry, I didn't understand that. You can ask me about prices, delivery, or how to order.";

    // Simple Rule-Based Logic
    if (q.includes("price") || q.includes("cost") || q.includes("expensive")) {
      answer = "Prices are set directly by farmers. You can see the price per unit on the product page. Farmers may also offer bulk discounts!";
    } else if (q.includes("delivery") || q.includes("shipping") || q.includes("pickup")) {
      answer = "Many farmers offer delivery within a specific radius. Check the farmer's profile or product details to see if they deliver to your location, or if pickup is available.";
    } else if (q.includes("order") || q.includes("buy") || q.includes("purchase")) {
      answer = "To order, simply add items to your cart and proceed to checkout. You'll need to create an account first.";
    } else if (q.includes("organic") || q.includes("pesticide")) {
      answer = "Farmers can list their products as Organic. Look for the leaf icon or check the product description for farming details.";
    } else if (q.includes("hello") || q.includes("hi")) {
      answer = "Hello! Converting specifically to you, I am the KisanBazar Assistant. How can I help you today?";
    }

    res.json({
      success: true,
      data: { answer }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
