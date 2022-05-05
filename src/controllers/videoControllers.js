import User from "../models/User";
import Video from "../models/Video";

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
  const videos = await Video.findById(id).populate("owner"); //몽구스가 비디오도 찾고 그 안에서 owner라는것도 찾아줌
  if (!videos) {
    return res.render("404", { pageTitle: "Not Found Video" });
  } else return res.render("watch", { pageTitle: `${videos.title}`, videos });
};
export const getUpload = (req, res) => {
  res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtag },
    file,
    session: {
      user: { _id },
    },
  } = req;
  try {
    const newVideo = await Video.create({
      owner: _id,
      videoFile: file.path,
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
