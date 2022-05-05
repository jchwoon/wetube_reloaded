import express from "express";
import {
  getEdit,
  postEdit,
  seeVideo,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoControllers";
import { protectorMiddleware, uploadVideos } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", seeVideo);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(uploadVideos.single("video"), postUpload);

export default videoRouter;
