const express = require("express");
const Post = require("../models/Post");
const { optionalAuth, requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(optionalAuth);
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [postCount, likedPosts, commentCount] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Post.countDocuments({ likes: userId }),
      Post.aggregate([
        { $match: { author: userId } },
        { $project: { count: { $size: "$comments" } } },
        { $group: { _id: null, total: { $sum: "$count" } } }
      ])
    ]);

    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 }).limit(5);

    res.render("dashboard", {
      postCount,
      likedPosts,
      commentCount: commentCount[0]?.total || 0,
      followers: req.user.followers.length,
      following: req.user.following.length,
      posts
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
