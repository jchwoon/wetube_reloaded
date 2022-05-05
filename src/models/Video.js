import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 40 },
  videoFile: { type: String, required: true },
  description: { type: String, required: true, trim: true, maxlength: 80 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtag: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

videoSchema.static("formatHashtag", function (hashtag) {
  return hashtag
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const videoModel = mongoose.model("Video", videoSchema);
export default videoModel;
