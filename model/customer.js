const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customer = new Schema({
  id_blok: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blok",
    required: true,
  },
  id_rumah: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true,
  },
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  nomor_str: {
    type: String,
    required: true,
  },
  verifikasi_data: {
    type: Boolean,
    required: true,
    enum: [true, false],
    default: false,
  },
  type_pembayaran: {
    type: String,
    required: true,
  },
  tanggalBooking: {
    type: Date,
    default: Date.now,
  },
  kavling: [
    {
      no_kavling: {
        type: String,
        required: false,
      },
      type: {
        type: String,
        required: false,
      },
      luas_bangunan: {
        type: String,
        required: false,
      },
      luas_tanah: {
        type: String,
        required: false,
      },
    },
  ],
  data_pribadi: [
    {
      namaLengkap: {
        type: String,
        required: false,
      },
      tempat_lahir: {
        type: String,
        required: false,
      },
      taggal_lahir: {
        type: String,
        required: false,
      },
      jenis_kelamin: {
        type: String,
        required: false,
      },
      pekerjaan: {
        type: String,
        required: false,
      },
      alamat: {
        type: String,
        required: false,
      },
      no_identitas: {
        type: String,
        required: false,
      },
      no_kontak: {
        type: String,
        required: false,
      },
      no_wa: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      status_tempat_tinggal: {
        type: String,
        required: false,
      },
      status_pernikahan: {
        type: String,
        required: false,
      },
      npwp: {
        type: String,
        required: false,
      },
    },
  ],
  pekerjaan: [
    {
      jenis_pekerjaan: {
        type: String,
        required: false,
      },
      jabatan: {
        type: String,
        required: false,
      },
      status_pekerjaan: {
        type: String,
        required: false,
      },
      nama_instansi: {
        type: String,
        required: false,
      },
      no_telpon_instansi: {
        type: String,
        required: false,
      },
      no_fax: {
        type: String,
        required: false,
      },
      penghasilan_tetap: {
        type: String,
        required: false,
      },
      penghasilan_tambahan: {
        type: String,
        required: false,
      },
      pengeluaran_perbulan: {
        type: String,
        required: false,
      },
      sumber_penghasilan_tambahan: {
        type: String,
        required: false,
      },
      jenis_usaha: {
        type: String,
        required: false,
      },
    },
  ],
  customerFile: [
    {
      ktp: {
        type: String,
        required: false,
      },
      npwp: {
        type: String,
        required: false,
      },
      kk: {
        type: String,
        required: false,
      },
      slip_gaji: {
        type: String,
        required: false,
      },
      buku_nikah: {
        type: String,
        required: false,
      },
      pas_foto: {
        type: String,
        required: false,
      },
    },
  ],
});

const Customer = mongoose.model("Customer", customer);
module.exports = Customer;
