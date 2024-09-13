const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const keuangan = new Schema({
  id_customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  nomor_pembayaran: {
    type: String,
    required: true,
  },
  harga_rumah: [
    {
      harga: {
        type: Number,
        required: true,
      },
      bunga: {
        type: Number,
        required: true,
      },
      cashBack: {
        type: Number,
        required: false,
      },
      dp: {
        type: Number,
        required: true,
      },
      jangka_waktu: {
        type: Date,
        required: true,
      },
    },
  ],
  kredit: [
    {
      tanggal: {
        type: Date,
        required: false,
      },
      saldo: {
        type: Number,
        required: false,
      },
    },
  ],
});

const Keuangan = mongoose.model("Keuangan", keuangan);
module.exports = Keuangan;
