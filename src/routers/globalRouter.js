import express from "express";
import {
  getLogin,
  postLogin,
  postJoin,
  getJoin,
} from "../controllers/userControllers";
import { home, searchVideo } from "../controllers/videoControllers";
import { publicOnlyMiddleware } from "../middlewares";

const globalRouter = express.Router();

globalRouter.get("/", home);
globalRouter
  .route("/join")
  .all(publicOnlyMiddleware)
  .get(getJoin)
  .post(postJoin);
globalRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);
globalRouter.get("/search", searchVideo);

export default globalRouter;
