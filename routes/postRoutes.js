const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const { optionalAuth, requireAuth } = require("../middleware/auth");
const { upload, processImage } = require("../middleware/upload");

const router = express.Router();

router.use(optionalAuth);

router.get("/", async (req, res, next) => {
  try {
    const {
      search = "",
      tag = "",
      sort = "newest",
      page = 1,
      limit = 6
    } = req.query;

    const filter = {};

    if (search.trim()) {
      filter.$or = [
        { content: { $regex: search.trim(), $options: "i" } },
        { tags: { $regex: search.trim(), $options: "i" } }
      ];
    }

    if (tag.trim()) filter.tags = tag.trim().toLowerCase();

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const perPage = Math.min(Math.max(Number(limit) || 6, 1), 30);
    const currentPage = Math.max(Number(page) || 1, 1);

    let query = Post.find(filter)
      .populate("author", "username avatar")
      .sort(sortOption);

    if (sort === "popular") {
      query = Post.find(filter)
        .populate("author", "username avatar")
        .sort({ "likes.length": -1, createdAt: -1 });
    }

    const total = await Post.countDocuments(filter);
    const posts = await query
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.render("index", {
      posts,
      search,
      tag,
      sort,
      currentPage,
      totalPages: Math.ceil(total / perPage)
    });
  } catch (err) {
    next(err);
  }
});

router.get("/new", requireAuth, (req, res) => {
  res.render("new", { error: null });
});

router.post("/", requireAuth, upload.single("image"), processImage, async (req, res, next) => {
  try {
    const tags = (req.body.tags || "")
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 10);

    await Post.create({
      author: req.user._id,
      content: req.body.content,
      tags,
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });

    res.redirect("/posts");
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username avatar bio");
    if (!post) return res.status(404).render("error", { title: "404", message: "Post not found." });

    res.render("show", { post });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/edit", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username");
    if (!post) return res.status(404).render("error", { title: "404", message: "Post not found." });

    if (post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).render("error", { title: "403", message: "You can edit only your own posts." });
    }

    res.render("edit", { post });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, upload.single("image"), processImage, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found.");

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can edit only your own posts.");
    }

    if (req.body.content) post.content = req.body.content;

    if (req.body.tags !== undefined) {
      post.tags = req.body.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    if (req.file) post.image = `/uploads/${req.file.filename}`;

    await post.save();
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found.");

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can delete only your own posts.");
    }

    await post.deleteOne();
    res.redirect("/posts");
  } catch (err) {
    next(err);
  }
});

router.post("/:id/like", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found.");

    const alreadyLiked = post.likes.some(id => id.toString() === req.user._id.toString());

    if (!alreadyLiked) {
      post.likes.push(req.user._id);
      await post.save();

      if (post.author.toString() !== req.user._id.toString()) {
        await User.findByIdAndUpdate(post.author, {
          $push: {
            notifications: {
              message: `${req.user.username} liked your post.`,
              type: "like"
            }
          }
        });
      }
    }

    res.redirect(req.get("referer") || "/posts");
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/like", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found.");

    post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    await post.save();

    res.redirect(req.get("referer") || "/posts");
  } catch (err) {
    next(err);
  }
});

router.post("/:id/comments", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found.");

    const text = (req.body.text || "").trim();
    if (!text) return res.redirect(`/posts/${post._id}`);

    post.comments.push({
      username: req.user.username,
      user: req.user._id,
      text
    });

    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      await User.findByIdAndUpdate(post.author, {
        $push: {
          notifications: {
            message: `${req.user.username} commented on your post.`,
            type: "comment"
          }
        }
      });
    }

    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/comments/:commentId", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found.");

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).send("Comment not found.");

    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).send("You cannot delete this comment.");
    }

    comment.deleteOne();
    await post.save();

    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/pin", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found.");

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).send("Only the owner can pin this post.");
    }

    post.pinned = !post.pinned;
    await post.save();

    res.redirect(req.get("referer") || `/posts/${post._id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
