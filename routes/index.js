const { Router } = require("express");
const User = require("../model/user");
const Blok = require("../model/blok");
const House = require("../model/house");
const Customer = require("../model/customer");
const Ticket = require("../model/openTicket");
const jwt = require("jsonwebtoken");
const { SECRET, MAX_AGE } = require("../consts");
const { requireLogin } = require("../middleware/authentication");
const multer = require("multer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const router = Router();

const createJwt = (payload) => {
  return jwt.sign({ payload }, SECRET, { expiresIn: MAX_AGE });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const encryptData = (data) => {
  const algorithm = "aes-256-cbc";
  const key = process.env.ENCRYPTION_KEY;
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    data: encrypted,
  };
};

const upload = multer({ storage: storage });

// Ticket Spezz
// Create Ticket
router.post("/ticket", async (req, res) => {
  const { ticket_header, ticket_contain } = req.body;

  try {
    const ticket = new Ticket({
      ticket_header,
      ticket_contain,
    });
    await ticket.save();

    res
      .status(201)
      .json({ message: "Ticket created successfully", data: ticket });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create ticket", error: error.message });
  }
});

// Get all Tickets
router.get("/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("ticket_header.id_user", "username email")
      .populate("ticket_header.id_customer", "data_pribadi.namaLengkap");

    res
      .status(200)
      .json({ message: "Tickets retrieved successfully", data: tickets });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving tickets", error: error.message });
  }
});

// Get single Ticket by ID
router.get("/ticket/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("ticket_header.id_user", "username email")
      .populate("ticket_header.id_customer", "data_pribadi.namaLengkap");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res
      .status(200)
      .json({ message: "Ticket retrieved successfully", data: ticket });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving ticket", error: error.message });
  }
});

// Update Ticket
router.put("/ticket/:id", async (req, res) => {
  const { ticket_header, ticket_contain, ticket_status } = req.body;

  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.ticket_header = ticket_header || ticket.ticket_header;
    ticket.ticket_contain = ticket_contain || ticket.ticket_contain;
    ticket.ticket_status =
      ticket_status !== undefined ? ticket_status : ticket.ticket_status;

    await ticket.save();

    res
      .status(200)
      .json({ message: "Ticket updated successfully", data: ticket });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update ticket", error: error.message });
  }
});

// Delete Ticket
router.delete("/ticket/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete ticket", error: error.message });
  }
});

// Search Spez
router.get("/search-customer", async (req, res) => {
  const { blokname } = req.query;

  if (!blokname) {
    return res.status(400).json({ message: "blokname is required" });
  }

  try {
    const blok = await Blok.findOne({ blokname });

    if (!blok) {
      return res.status(404).json({ message: "Blok not found" });
    }

    const customers = await Customer.find({ id_blok: blok._id })
      .populate("id_blok", "blokname")
      .populate("id_rumah", "no_rumah type_rumah");

    if (customers.length === 0) {
      return res
        .status(404)
        .json({ message: "No customers found for this blok" });
    }

    res.status(200).json({ message: "Customers found", data: customers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching customers", error: error.message });
  }
});

// Customer Spezz

router.get("/customer", (req, res) => {
  Customer.find()
    .populate("id_blok")
    .populate("id_rumah")
    .populate("id_user", "username")
    .then((customers) => {
      res.status(200).json({ message: "success", data: customers });
    })
    .catch((error) => {
      res.status(400).json({ message: "Error fetching customers", error });
    });
});

router.get("/customer/:id", (req, res) => {
  Customer.findById(req.params.id)
    .populate("id_blok")
    .populate("id_rumah")
    .populate("id_user", "username")
    .then((customer) => {
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(200).json({ message: "success", data: customer });
    })
    .catch((error) => {
      res.status(400).json({ message: "Error fetching customer", error });
    });
});

router.get("/unverified-customers", async (req, res) => {
  try {
    const unverifiedCustomers = await Customer.find({ verifikasi_data: false })
      .populate("id_blok", "blokname")
      .populate("id_rumah", "no_rumah type_rumah")
      .populate("id_user", "username");

    if (unverifiedCustomers.length === 0) {
      return res.status(404).json({ message: "No unverified customers found" });
    }

    res.status(200).json({
      message: "Unverified customers retrieved successfully",
      data: unverifiedCustomers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving unverified customers",
      error: error.message,
    });
  }
});

router.get("/verified-customers", async (req, res) => {
  try {
    const verifiedCustomers = await Customer.find({ verifikasi_data: true })
      .populate("id_blok", "blokname")
      .populate("id_rumah", "no_rumah type_rumah status_rumah")
      .populate("id_user", "username");

    if (verifiedCustomers.length === 0) {
      return res.status(404).json({ message: "No unverified customers found" });
    }

    res.status(200).json({
      message: "Unverified customers retrieved successfully",
      data: verifiedCustomers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving unverified customers",
      error: error.message,
    });
  }
});

router.post(
  "/customer",
  requireLogin,
  upload.fields([
    { name: "ktp", maxCount: 1 },
    { name: "npwp", maxCount: 1 },
    { name: "kk", maxCount: 1 },
    { name: "slip_gaji", maxCount: 1 },
    { name: "buku_nikah", maxCount: 1 },
    { name: "pas_foto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const token = req.cookies.auth;
      const decodedToken = jwt.verify(token, SECRET);
      const id_user = decodedToken.payload;

      const customerData = {
        ...req.body,
        kavling: JSON.parse(req.body.kavling),
        data_pribadi: JSON.parse(req.body.data_pribadi),
        pekerjaan: JSON.parse(req.body.pekerjaan),
        id_user: id_user,
      };

      const customerFiles = {
        ktp: req.files.ktp ? req.files.ktp[0].path : "",
        npwp: req.files.npwp ? req.files.npwp[0].path : "",
        kk: req.files.kk ? req.files.kk[0].path : "",
        slip_gaji: req.files.slip_gaji ? req.files.slip_gaji[0].path : "",
        buku_nikah: req.files.buku_nikah ? req.files.buku_nikah[0].path : "",
        pas_foto: req.files.pas_foto ? req.files.pas_foto[0].path : "",
      };

      const newCustomerData = {
        ...customerData,
        customerFile: customerFiles,
      };

      const customer = await Customer.create(newCustomerData);
      res.status(201).json({
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error) {
      res.status(400).json({
        message: "Error parsing customer data",
        error: error.message,
      });
    }
  }
);

router.put(
  "/customer/edit/:id",
  upload.single("customerFile"),
  async (req, res) => {
    const customerId = req.params.id;
    let customerFile = req.file ? req.file.path : null;

    const updatedData = {
      ...req.body,
      customerFile,
    };

    try {
      const customer = await Customer.findByIdAndUpdate(
        customerId,
        updatedData,
        {
          new: true,
        }
      );

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.status(200).json({
        message: "Customer updated successfully",
        customer,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating customer",
        error: error.message,
      });
    }
  }
);

router.put("/verifikasi/:id", async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { verifikasi_data: true },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer verification updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating customer verification",
      error: error.message,
    });
  }
});

router.put("/verifikasi/batal/:id", async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { verifikasi_data: false },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer verification updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating customer verification",
      error: error.message,
    });
  }
});

// House Update

router.put("/update-house-status/:id", async (req, res) => {
  try {
    const updatedHouse = await House.findByIdAndUpdate(
      req.params.id,
      { status_rumah: false },
      { new: true }
    );

    if (!updatedHouse) {
      return res.status(404).json({ message: "House not found" });
    }

    res.status(200).json({
      message: "House status updated successfully",
      house: updatedHouse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating house status",
      error: error.message,
    });
  }
});

router.put("/deupdate-house-status/:id", async (req, res) => {
  try {
    const updatedHouse = await House.findByIdAndUpdate(
      req.params.id,
      { status_rumah: true },
      { new: true }
    );

    if (!updatedHouse) {
      return res.status(404).json({ message: "House not found" });
    }

    res.status(200).json({
      message: "House status updated successfully",
      house: updatedHouse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating house status",
      error: error.message,
    });
  }
});

router.delete("/customer/delete/:id", (req, res) => {
  Customer.findByIdAndDelete(req.params.id)
    .then((customer) => {
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(200).json({ message: "Customer deleted successfully" });
    })
    .catch((error) => {
      res.status(400).json({ message: "Error deleting customer", error });
    });
});

router.get("/blok", (req, res) => {
  Blok.find()
    .then((bloks) => {
      // const resData = { message: "success", data: bloks };
      // const encryptedData = encryptData(resData);
      // res.status(200).json(encryptedData);
      res.status(200).json({ message: "success", data: bloks });
    })
    .catch((error) => res.status(400).json({ message: "error", error }));
});

router.get("/blok/:id", (req, res) => {
  Blok.findById(req.params.id)
    .then((blok) => {
      if (!blok) {
        return res.status(404).json({ error: "Blok not found" });
      }
      res.json({ data: blok });
    })
    .catch((error) => res.status(400).json({ error }));
});

router.post("/blok", (req, res) => {
  const { blokname } = req.body;
  Blok.create({
    blokname,
  })
    .then((bloks) => {
      res.status(201).json({ message: "success", data: bloks });
    })
    .catch((error) => res.status(400).json({ message: "error", error }));
});

router.put("/blok/edit/:id", (req, res) => {
  const { id } = req.params;
  const { blokname } = req.body;

  Blok.findById(id)
    .then((bloks) => {
      if (!bloks) {
        return res.status(404).json({ message: "bloks not found" });
      }
      bloks.blokname = blokname || bloks.blokname;

      return bloks.save();
    })
    .then((updatedBoards) => {
      res.status(200).json({ message: "success", data: updatedBoards });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "error", error });
    });
});

router.delete("/blok/delete/:id", (req, res) => {
  const { id } = req.params;
  Blok.findByIdAndDelete(id)
    .then(() => res.status(200).json({ message: "success" }))
    .catch((error) => res.status(400).json({ message: "error", error }));
});

router.get("/house", (req, res) => {
  House.find()
    .then((houses) => {
      // const resData = { message: "success", data: houses };
      // const encryptedData = encryptData(resData);
      // res.status(200).json(encryptedData);
      res.status(200).json({ message: "success", data: houses });
    })
    .catch((error) => res.status(400).json({ message: "error", error }));
});

router.get("/house/:id_rumah", (req, res) => {
  House.findOne({ id_rumah: req.params.id_rumah })
    .then((house) => {
      if (!house) {
        return res.status(404).json({ error: "House not found" });
      }
      res.json({ data: house });
    })
    .catch((error) => res.status(400).json({ error }));
});

router.post("/house", (req, res) => {
  const { id_blok, id_rumah, no_rumah, type_rumah, status_rumah } = req.body;
  House.create({
    id_blok,
    id_rumah,
    no_rumah,
    type_rumah,
    status_rumah,
  })
    .then((houses) => {
      res.status(201).json({ message: "success", data: houses });
    })
    .catch((error) => res.status(400).json({ message: "error", error }));
});

router.put("/house/edit/:id", (req, res) => {
  const { id } = req.params;
  const { id_blok, id_rumah, no_rumah, type_rumah, status_rumah } = req.body;
  House.findById(id)
    .then((houses) => {
      if (!houses) {
        return res.status(404).json({ message: "houses not found" });
      }
      houses.id_blok = id_blok || houses.id_blok;
      houses.id_rumah = id_rumah || houses.id_rumah;
      houses.no_rumah = no_rumah || houses.no_rumah;
      houses.type_rumah = type_rumah || houses.type_rumah;
      houses.status_rumah = status_rumah;

      return houses.save();
    })
    .then((updatedBoards) => {
      res.status(200).json({ message: "success", data: updatedBoards });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "error", error });
    });
});

router.delete("/blok/delete/:id", (req, res) => {
  const { id } = req.params;
  Blok.findByIdAndDelete(id)
    .then(() => res.status(200).json({ message: "success" }))
    .catch((error) => res.status(400).json({ message: "error", error }));
});

router.get("/users/marketing", async (req, res) => {
  try {
    const marketingAccounts = await User.find(
      { role: "marketing" },
      { username: 1, email: 1, verified: 1, role: 1 }
    );
    res.status(200).json({ message: "success", data: marketingAccounts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching marketing accounts", error });
  }
});
router.put("/users/:id", async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) {
      user.username = username;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
});
router.put("/users/verify/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User verified successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error verifying user", error });
  }
});
router.put("/users/unverify/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified: false },
      { new: false }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User verified successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error verifying user", error });
  }
});
/**
 * @route POST api/users/register
 * @desc Register new user
 * @access Private
 */
router.post("/users/register", (req, res) => {
  const { username, email, password } = req.body;
  User.create({ username, email, password })
    .then(() => {
      return res.status(200).json({ message: "success" });
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({ message: "failed", error });
    });
});

/**
 * @route POST api/users/login
 * @desc Login user
 * @access Public
 */

router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "failed", error: "wrong-credentials" });
    }
    if (!user.verified) {
      return res
        .status(401)
        .json({ message: "failed", error: "wrong-credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "failed", error: "wrong-credentials" });
    }

    const maxAge = 3 * 24 * 60 * 60;
    const token = createJwt(user._id, maxAge);
    res.cookie("auth", token, { httpOnly: true, maxAge: maxAge * 1000 });
    return res.status(200).json({ message: "success", data: user });
  } catch (err) {
    return res.status(400).json({ message: "failed", error: err.message });
  }
});

/**
 * @route POST api/users/logout
 * @desc Log user out
 * @access Public
 */
router.post("/users/logout", (req, res) => {
  res.clearCookie("auth");
  return res.status(200).json({ message: "success" });
});

/**
 * @route GET api/users
 * @desc Get authenticated user
 * @access Private
 */
router.get("/users", requireLogin, (req, res) => {
  const token = req.cookies.auth;
  const _id = jwt.verify(token, SECRET).payload;
  User.findOne({ _id }, { username: 1, email: 1, registrationDate: 1 })
    .then((user) => {
      return res.status(200).json({ message: "success", data: user });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(401)
        .json({ message: "error", code: "unauthenticated-access" });
    });
});

router.get("/user/history", requireLogin, async (req, res) => {
  try {
    const token = req.cookies.auth;
    const decodedToken = jwt.verify(token, SECRET);
    const id_user = decodedToken.payload;

    const customers = await Customer.find({ id_user: id_user })
      .populate("id_blok", "blokname")
      .populate("id_rumah", "no_rumah type_rumah");

    if (customers.length === 0) {
      return res.status(404).json({
        message: "No history found for this user",
      });
    }

    res.status(200).json({
      message: "User history retrieved successfully",
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving user history",
      error: error.message,
    });
  }
});

module.exports = router;
