import { Router } from "express";

const router = Router();

// import controllers

import * as controller from "../controllers/appController.js";
import Auth, {localVariable} from "../middleware/auth.js";
import { registerMail } from "../controllers/mailer.js";

// post method
router.route("/register").post(controller.register);
router.route("/registerMail").post(registerMail);
router.route("/autheticate").post((req, res) => {
  res.json("autheticate route");
});
router.route("/login").post(controller.verifyUser, controller.login);

// get method

router.route("/user/:username").get(controller.getUser);

router.route('/generateOTP').get(controller.verifyUser, localVariable, controller.generateOTP)

router.route("/verifyOTP").get(controller.verifyOTP);

router.route("/createResetSession").get(controller.createResetSession);

// PUT method

router.route("/updateUser").put(Auth, controller.updateUser);

router.route("/resetPassword").put(controller.verifyUser, controller.resetPassword);

export default router;
