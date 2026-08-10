const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const { optionalAuth, requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(optionalAuth);

router.get("/:username", async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("followers", "username")
      .populate("following", "username");

    if (!user) return res.status(404).render("error", { title: "404", message: "User not found." });

    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });
    const isFollowing = req.user
      ? user.followers.some(id => id.toString() === req.user._id.toString())
      : false;

    res.render("profile", { user, posts, isFollowing });
  } catch (err) {
    next(err);
  }
});

router.patch("/:username/follow", requireAuth, async (req, res, next) => {
  try {
    const target = await User.findOne({ username: req.params.username });
    if (!target) return res.status(404).send("User not found.");

    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).send("You cannot follow yourself.");
    }

    const alreadyFollowing = target.followers.some(
      id => id.toString() === req.user._id.toString()
    );

    if (!alreadyFollowing) {
      target.followers.push(req.user._id);
      req.user.following.push(target._id);

      await target.save();
      await req.user.save();

      target.notifications.push({
        message: `${req.user.username} started following you.`,
        type: "follow"
      });
      await target.save();
    }

    res.redirect(`/users/${target.username}`);
  } catch (err) {
    next(err);
  }
});

router.delete("/:username/follow", requireAuth, async (req, res, next) => {
  try {
    const target = await User.findOne({ username: req.params.username });
    if (!target) return res.status(404).send("User not found.");

    target.followers = target.followers.filter(
      id => id.toString() !== req.user._id.toString()
    );

    req.user.following = req.user.following.filter(
      id => id.toString() !== target._id.toString()
    );

    await target.save();
    await req.user.save();

    res.redirect(`/users/${target.username}`);
  } catch (err) {
    next(err);
  }
});

router.get("/:username/notifications", requireAuth, async (req, res, next) => {
  try {
    if (req.params.username !== req.user.username) {
      return res.status(403).send("Forbidden");
    }

    const user = await User.findById(req.user._id);
    res.render("notifications", { notifications: user.notifications.sort((a, b) => b.createdAt - a.createdAt) });
  } catch (err) {
    next(err);
  }
});

router.patch("/:username/notifications/read", requireAuth, async (req, res, next) => {
  try {
    if (req.params.username !== req.user.username) return res.status(403).send("Forbidden");

    await User.updateOne(
      { _id: req.user._id },
      { $set: { "notifications.$[].read": true } }
    );

    res.redirect(`/users/${req.user.username}/notifications`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
