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
  status_dp: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },
  perhitungan_harga_rumah: [
    {
      harga_rumah: {
        type: Number,
        required: true,
      },
      kelebihan_tanah: {
        type: Number,
        required: true,
      },
      harga_lokasi: {
        type: Number,
        required: true,
      },
      biaya_proses: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        required: false,
      },
      total_acc_bank: {
        type: Number,
        required: false,
      },
      status_perhitungan: {
        type: Boolean,
        default: false,
      },
      tgl_perhitungan: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  harga_rumah: [
    {
      total: {
        type: Number,
        required: false,
      },
      dp: {
        type: Number,
        required: false,
      },
      total_akhir: {
        type: Number,
        required: false,
      },
      tgl_kalkulasi: {
        type: Date,
        default: Date.now(),
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
      status_kredit: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const Keuangan = mongoose.model("Keuangan", keuangan);
module.exports = Keuangan;
