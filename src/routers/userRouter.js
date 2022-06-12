import express from "express";
import {
  getChangePassword,
  postChangePassword,
  getEdit,
  postEdit,
  logout,
  startGithubLogin,
  finalGithubLogin,
  seeProfile,
} from "../controllers/userControllers";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  uploadAvatar,
} from "../middlewares";

const userRouter = express.Router();

userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/final", publicOnlyMiddleware, finalGithubLogin);
userRouter
  .route("/edit-profile")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(uploadAvatar.single("avatar"), postEdit);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter.get("/:id", seeProfile);

export default userRouter;
