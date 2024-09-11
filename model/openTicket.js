const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticket = new Schema({
  ticket_header: [
    {
      id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      id_customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },
    },
  ],
  ticket_contain: {
    type: String,
    required: true,
  },
  ticket_status: {
    type: Boolean,
    required: true,
    enum: [true, false],
    default: false,
  },
});

const Ticket = mongoose.model("Ticket", ticket);
module.exports = Ticket;
