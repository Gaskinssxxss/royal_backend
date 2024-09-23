const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true, // User yang mengirim notifikasi
  },
  related_user: {
    type: Schema.Types.ObjectId,
    ref: "User", // User terkait yang akan menerima notifikasi, misalnya Marketing
    required: false,
  },
  content: {
    type: String,
    required: true,
  },
  role_receivers: [
    {
      type: String,
      enum: ["admin", "marketing", "direktur", "keuangan"],
      required: true, // Role penerima notifikasi
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
