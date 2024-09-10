const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const house = new Schema({
  id_blok: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blok",
    required: true,
  },
  id_rumah: {
    type: String,
    required: true,
  },
  no_rumah: {
    type: String,
    required: true,
  },
  type_rumah: {
    type: String,
    required: true,
  },
  status_rumah: {
    type: Boolean,
    enum: [true, false],
    required: true,
    default: true,
  },
});

const House = mongoose.model("House", house);
module.exports = House;
