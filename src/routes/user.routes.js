import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//route for registered user
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 5 },
  ]),
  registerUser
);

//route for logging in user
//router.route("/login").post(loginUser);

// secured routes
//route for logging off user
//router.route("/logOut").post(verifyJWT, logOutUser);

//console.log(router);
router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logOutUser);

export default router;
