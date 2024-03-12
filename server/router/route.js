import {Router} from "express";

const router = Router();


// import controllers

import * as controller from '../controllers/appController.js';


// post method
router.route("/register").post(controller.register)
router.route("/registerMail").post((req,res)=>{
  res.json("register mail route");
})
router.route("/autheticate").post((req,res)=>{
  res.json("autheticate route");
})
router.route("/login").post(controller.login)

// get method

router.route('/user/:username').get(controller.getUser);

router.route('/genrateOTP').get(controller.generateOTP);

router.route('/verifyOTP').get(controller.verifyOTP);

router.route('/createResetSession').get(controller.createResetSession);


// PUT method

router.put('/updateUser').put(controller.updateUser);

router.put('/resetPassword').put(controller.resetPassword);

export default router;