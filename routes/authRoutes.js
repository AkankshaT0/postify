const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.use(optionalAuth);

router.get("/register", (req, res) => {
  if (req.user) return res.redirect("/posts");
  res.render("register", { error: null });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.render("register", { error: "All fields are required." });
    }

    const exists = await User.findOne({
      $or: [{ username }, { email: email.toLowerCase() }]
    });

    if (exists) {
      return res.render("register", { error: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect("/posts");
  } catch (err) {
    res.render("register", { error: err.message });
  }
});

router.get("/login", (req, res) => {
  if (req.user) return res.redirect("/posts");
  res.render("login", { error: null });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.render("login", { error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect("/posts");
  } catch (err) {
    res.render("login", { error: err.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/posts");
});

module.exports = router;
