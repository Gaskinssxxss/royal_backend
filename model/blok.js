const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blok = new Schema({
  blokname: {
    type: String,
    required: true,
  },
});

const Blok = mongoose.model("Blok", blok);
module.exports = Blok;
