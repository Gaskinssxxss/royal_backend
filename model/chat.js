const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  visitorID: { type: String, required: true },
  messages: [
    {
      sender: { type: String, required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  isActive: { type: Boolean, default: true },
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
