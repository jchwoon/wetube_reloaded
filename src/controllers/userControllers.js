import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "cross-fetch";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;
  const userExist = await User.exists({ username });
  if (userExist) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "닉네임이 사용중입니다.",
    });
  }
  const emailExist = await User.exists({ email });
  if (emailExist) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "이메일이 사용중입니다.",
    });
  }
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "패스워드가 일치하지 않습니다.",
    });
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    console.log(error);
    return res.render("join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "An account with this username does not exists",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "Wrong Password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};
export const startGithubLogin = (req, res) => {
  const basic_URL = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const final_URL = `${basic_URL}?${params}`;
  res.redirect(final_URL);
};
export const finalGithubLogin = async (req, res) => {
  const base_URL = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const final_URL = `${base_URL}?${params}`;
  const tokenRequest = await (
    await fetch(final_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatarUrl,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};
export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const getEdit = (req, res) =>
  res.render("edit-profile", { pageTitle: "Edit Profile" });
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, username, email, location },
    file,
  } = req;
  if (req.session.user.username !== username) {
    const userExist = await User.exists({ username });
    if (userExist) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit-Profile",
        errorMessage: "닉네임이 사용중입니다.",
      });
    }
  }
  if (req.session.user.email !== email) {
    const emailExist = await User.exists({ email });
    if (emailExist) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit-Profile",
        errorMessage: "이메일이 사용중입니다.",
      });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      username,
      email,
      location,
    },
    { new: true }
  );
  console.log(avatarUrl);
  req.session.user = updatedUser;
  res.redirect("edit-profile");
};
export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldpassword, newpassword, checkpassword },
  } = req;
  //새비밀번호랑 확인비밀번호랑 다를때, 올드 비밀번호와 데이터베 비밀번호와다를때, 비밀번호를 바꿧으면 바뀐비밀번호를 해쉬값으로 다시 감싸줘야함
  //새 비밀번호를 해쉬값으로 다시
  if (oldpassword === newpassword) {
    res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "기존비밀번호와 새비밀번호가 일치합니다",
    });
  }
  const ok = await bcrypt.compare(oldpassword, password);
  if (!ok) {
    res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "기존 비밀번호가 올바르지 않습니다.",
    });
  }
  if (newpassword !== checkpassword) {
    res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "새비밀번호와 확인비밀번호가 일치하지않습니다",
    });
  }
  const user = await User.findById(_id);
  user.password = newpassword;
  user.save();
  req.session.user.password = user.password;
  res.redirect("/");
};

export const seeProfile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "Not Found User" });
  }
  res.render("users/profile", { pageTitle: user.username, user });
};

// 유저가 리퀘스트 요청을 보내면 에서 유저 정보를스트를유저한 갖고있 다시 리퀘스트를 할때마다 그 텍스트를 달라고 서버가 요청할거
