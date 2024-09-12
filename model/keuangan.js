const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const keuangan = new Schema({
  id_customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  dp: {
    type: String,
    required: true,
  },
  total: {
    type: String,
    required: true,
  },
  bunga: {
    type: String,
    required: false,
  },
  cashBack: {
    type: String,
    required: false,
  },
  kredit: [
    {
      tanggal: {
        type: String,
        required: false,
      },
      saldo: {
        type: String,
        required: false,
      },
    },
  ],
  jangka_waktu: {
    type: Date,
    required: true,
  },
});

const Keuangan = mongoose.model("Keuangan", keuangan);
module.exports = Keuangan;
