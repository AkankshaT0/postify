require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.redirect("/posts"));

app.use("/", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);
app.use("/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).render("error", {
    title: "404",
    message: "Page not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", {
    title: "500",
    message: err.message || "Something went wrong"
  });
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
});
