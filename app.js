require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// Middleware
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://192.168.1.4:8080",
      credentials: true,
    })
  );
} else {
  app.use(cors());
}
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("INFO - MongoDB connected successfully."))
  .catch((err) => console.log(`ERROR - MongoDB not connected : ${err}`));

const apiRoutes = require("./routes");
app.use("/api", apiRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname + "/public")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
