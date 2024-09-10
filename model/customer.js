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
  verifikasi_data: {
    type: Boolean,
    required: true,
    enum: [true, false],
    default: false,
  },
  kavling: [
    {
      no_kavling: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      luas_bangunan: {
        type: String,
        required: true,
      },
      luas_tanah: {
        type: String,
        required: true,
      },
    },
  ],
  data_pribadi: [
    {
      namaLengkap: {
        type: String,
        required: true,
      },
      tempat_lahir: {
        type: String,
        required: true,
      },
      taggal_lahir: {
        type: String,
        required: true,
      },
      jenis_kelamin: {
        type: String,
        required: true,
      },
      pekerjaan: {
        type: String,
        required: true,
      },
      alamat: {
        type: String,
        required: true,
      },
      no_identitas: {
        type: String,
        required: true,
      },
      no_kontak: {
        type: String,
        required: true,
      },
      no_wa: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      status_tempat_tinggal: {
        type: String,
        required: true,
      },
      status_pernikahan: {
        type: String,
        required: true,
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
        required: true,
      },
      jabatan: {
        type: String,
        required: true,
      },
      status_pekerjaan: {
        type: String,
        required: true,
      },
      nama_instansi: {
        type: String,
        required: true,
      },
      no_telpon_instansi: {
        type: String,
        required: true,
      },
      no_fax: {
        type: String,
        required: true,
      },
      penghasilan_tetap: {
        type: String,
        required: true,
      },
      penghasilan_tambahan: {
        type: String,
        required: true,
      },
      pengeluaran_perbulan: {
        type: String,
        required: true,
      },
      sumber_penghasilan_tambahan: {
        type: String,
        required: true,
      },
      jenis_usaha: {
        type: String,
        required: true,
      },
    },
  ],
  customerFile: [
    {
      ktp: {
        type: String,
        required: true,
      },
      npwp: {
        type: String,
        required: true,
      },
      kk: {
        type: String,
        required: true,
      },
      slip_gaji: {
        type: String,
        required: true,
      },
      buku_nikah: {
        type: String,
        required: true,
      },
      pas_foto: {
        type: String,
        required: true,
      },
    },
  ],
});

const Customer = mongoose.model("Customer", customer);
module.exports = Customer;
