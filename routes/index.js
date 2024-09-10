const { Router } = require("express");
const User = require("../model/user");
const Blok = require("../model/blok");
const House = require("../model/house");
const Customer = require("../model/customer");
const jwt = require("jsonwebtoken");
const { SECRET, MAX_AGE } = require("../consts");
const { requireLogin } = require("../middleware/authentication");
const multer = require("multer");
const crypto = require("crypto");

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

router.get("/customer", (req, res) => {
  Customer.find()
    .populate("id_blok")
    .populate("id_rumah")
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
    // Find customers where 'verifikasi_data' is false and populate related fields
    const unverifiedCustomers = await Customer.find({ verifikasi_data: false })
      .populate("id_blok", "blokname") // Populate id_blok to get blokname
      .populate("id_rumah", "no_rumah type_rumah"); // Populate id_rumah to get no_rumah and type_rumah

    // If no data found
    if (unverifiedCustomers.length === 0) {
      return res.status(404).json({ message: "No unverified customers found" });
    }

    // Send the data to the client
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
    // Find customers where 'verifikasi_data' is false and populate related fields
    const verifiedCustomers = await Customer.find({ verifikasi_data: true })
      .populate("id_blok", "blokname") // Populate id_blok to get blokname
      .populate("id_rumah", "no_rumah type_rumah"); // Populate id_rumah to get no_rumah and type_rumah

    // If no data found
    if (verifiedCustomers.length === 0) {
      return res.status(404).json({ message: "No unverified customers found" });
    }

    // Send the data to the client
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
  upload.fields([
    { name: "ktp", maxCount: 1 },
    { name: "npwp", maxCount: 1 },
    { name: "kk", maxCount: 1 },
    { name: "slip_gaji", maxCount: 1 },
    { name: "buku_nikah", maxCount: 1 },
    { name: "pas_foto", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const customerData = {
        ...req.body,
        kavling: JSON.parse(req.body.kavling),
        data_pribadi: JSON.parse(req.body.data_pribadi),
        pekerjaan: JSON.parse(req.body.pekerjaan),
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

      Customer.create(newCustomerData)
        .then((customer) => {
          res.status(201).json({
            message: "Customer created successfully",
            data: customer,
          });
        })
        .catch((error) => {
          res.status(400).json({
            message: "Error creating customer",
            error,
          });
        });
    } catch (error) {
      res.status(400).json({
        message: "Error parsing customer data",
        error,
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
    // Get the customer by ID and update 'verifikasi_data' to true
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id, // The ID of the customer to update
      { verifikasi_data: true }, // The update to apply
      { new: true } // Return the updated document
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
    // Get the customer by ID and update 'verifikasi_data' to true
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id, // The ID of the customer to update
      { verifikasi_data: false }, // The update to apply
      { new: true } // Return the updated document
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

router.put("/update-house-status/:id", async (req, res) => {
  try {
    // Update 'status_rumah' to true in House model
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

// router.post("/customer", (req, res) => {
//   const customerData = req.body;

//   Customer.create(customerData)
//     .then((customer) => {
//       res
//         .status(201)
//         .json({ message: "Customer created successfully", data: customer });
//     })
//     .catch((error) => {
//       res.status(400).json({ message: "Error creating customer", error });
//     });
// });

// router.get("/customer/:id", (req, res) => {
//   Customer.findById(req.params.id)
//     .populate("id_blok")
//     .populate("id_rumah")
//     .then((customer) => {
//       if (!customer) {
//         return res.status(404).json({ message: "Customer not found" });
//       }
//       res.status(200).json({ message: "success", data: customer });
//     })
//     .catch((error) => {
//       res.status(400).json({ message: "Error fetching customer", error });
//     });
// });

// router.put("/customer/edit/:id", (req, res) => {
//   const updatedData = req.body;

//   Customer.findByIdAndUpdate(req.params.id, updatedData, { new: true })
//     .then((updatedCustomer) => {
//       if (!updatedCustomer) {
//         return res.status(404).json({ message: "Customer not found" });
//       }
//       res.status(200).json({
//         message: "Customer updated successfully",
//         data: updatedCustomer,
//       });
//     })
//     .catch((error) => {
//       res.status(400).json({ message: "Error updating customer", error });
//     });
// });

// router.delete("/customer/delete/:id", (req, res) => {
//   Customer.findByIdAndDelete(req.params.id)
//     .then((customer) => {
//       if (!customer) {
//         return res.status(404).json({ message: "Customer not found" });
//       }
//       res.status(200).json({ message: "Customer deleted successfully" });
//     })
//     .catch((error) => {
//       res.status(400).json({ message: "Error deleting customer", error });
//     });
// });

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
  House.findOne({ id_rumah: req.params.id_rumah }) // Menggunakan id_rumah untuk pencarian
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
router.post("/users/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email, password: password })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "failed", error: "wrong-credentials" });
      }
      const maxAge = 3 * 24 * 60 * 60;
      const token = createJwt(user._id, maxAge);
      res.cookie("auth", token, { httpOnly: true, maxAge: maxAge * 10 });
      return res.status(200).json({ message: "success", data: user });
    })
    .catch((err) => {
      return res.status(400).json({ message: "failed", err });
    });
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

module.exports = router;
