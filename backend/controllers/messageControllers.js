const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    // Create the message
    var message = await Message.create(newMessage);
    console.log("Message created:", message);

    // Populate the message
    const populatedMessage = await Message.populate(message, {
      path: "sender",
      select: "name pic",
    });

    // Populate the chat in the message
    const populatedUser = await Message.populate(populatedMessage, {
      path: "chat",
    });

    // Further processing with populatedUser...
    // Update the latestMessage in the chat
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: populatedUser,
    });

    res.json(populatedUser);
  } catch (error) {
    console.error("Error creating message:", error.message);
    res.status(400).json({ error: error.message });
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages };
