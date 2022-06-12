import multer from "multer";

export const localMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    res.locals.loggedIn = true;
  }
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

// 로그인 돼 있는 사람들만 접근하게끔
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

// 로그인 안돼 있는 사람들만 접근하게끔 이걸 만드는 이유 예시: 로그인 한 사람 다시 로그인 페이지로 가는걸 막기위해
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "You already loggedin");
    return res.redirect("/");
  }
};

export const uploadAvatar = multer({
  dest: "upload/avatar/",
  limits: {
    fileSize: 3000000,
  },
});
export const uploadVideos = multer({
  dest: "upload/video/",
  limits: {
    fileSize: 10000000,
  },
});
