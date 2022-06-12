import { async } from "regenerator-runtime";
import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comments";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  res.render("home", { pageTitle: "Home", videos });
};
export const getEdit = async (req, res) => {
  const id = req.params.id;
  const {
    user: { _id },
  } = req.session;
  const videos = await Video.findById(id);
  if (String(videos.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  } else {
    if (!videos) {
      return res.status(404).render("404", { pageTitle: "Not Found Video" });
    } else return res.render("edit", { pageTitle: `Edit`, videos });
  }
};
export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const id = req.params.id;
  const { title, description, hashtag } = req.body;
  const videos = await Video.exists({ _id: id });
  if (!videos) {
    return res.status(404).render("404", { pageTitle: "Not Found Video" });
  }
  if (String(videos.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title: title,
    description: description,
    hashtag: Video.formatHashtag(hashtag),
  });
  return res.redirect(`/videos/${id}`);
};
export const seeVideo = async (req, res) => {
  const { id } = req.params;
  const videos = await Video.findById(id).populate("owner").populate("comment"); //몽구스가 비디오도 찾고 그 안에서 owner라는것도 찾아줌
  const reverseComment = [...videos.comment].reverse();
  console.log(reverseComment);
  if (!videos) {
    return res.render("404", { pageTitle: "Not Found Video" });
  } else
    return res.render("watch", {
      pageTitle: `${videos.title}`,
      videos,
      reverseComment,
    });
};
export const getUpload = (req, res) => {
  res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtag },
    session: {
      user: { _id },
    },
  } = req;
  const { video, thumb } = req.files;
  console.log(req.files);
  try {
    const newVideo = await Video.create({
      owner: _id,
      videoFile: video[0].path.replace(/[\\]/g, "/"),
      thumbUrl: thumb[0].path.replace(/[\\]/g, "/"),
      title,
      description,
      hashtag: Video.formatHashtag(hashtag),
      meta: {
        views: 0,
        rating: 0,
      },
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  const user = await User.findById(_id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Not Found Video" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
  await Video.findOneAndDelete({ _id: id });
  return res.redirect("/");
};
export const searchVideo = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: { $regex: new RegExp(keyword, "i") },
    }).populate("owner");
  }
  res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  } else {
    video.meta.views += 1;
    await video.save();
    return res.sendStatus(200);
  }
};

export const registerComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  const user = await User.findById(_id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: _id,
    video: id,
  });
  video.comment.push(comment._id);
  video.save();
  user.comment.push(comment._id);
  user.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { commentid },
  } = req;
  const comment = await Comment.findById(commentid).populate("owner");
  const videoId = comment.video;
  if (String(comment.owner._id) !== String(_id)) {
    return res.sendStatus(404);
  }
  const video = await Video.findById(videoId);
  if (!video) {
    return res.sendStatus(404);
  }
  video.comment.splice(video.comment.indexOf(commentid), 1);
  await video.save();
  await Comment.findByIdAndDelete(commentid);
  return res.sendStatus(200);
};
