const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  image: {
    url: {
        type: String,
        default: ""
    },
    publicId: {
        type: String,
        default: ""
    }
},
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  comments: [commentSchema],
  pinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
