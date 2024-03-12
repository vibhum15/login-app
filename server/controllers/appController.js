import userModel from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import ENV from '../config.js'

/** POST: http://localhost:8080/api/register
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res) {
  try {
    const { username, password, profile, email } = req.body;

    // check the existing user name
    const existUsername = new Promise((resolve, reject) => {
      userModel.findOne({username: username })
      .then((user)=>{
        if(user){
          console.log("username promise not resolved");
          reject({ error: "please use unique username" });
        }
        resolve();
      })
      .catch((err)=>{
        console.log("username promise not resolved");
          reject(new Error(err));
      })})

    const existEmail = new Promise((resolve, reject) => {
      userModel.findOne({email: email })
      .then((user)=>{
        if(user){
          console.log("email promise not resolved");
          reject({ error: "please use unique email" });
        }
        resolve();
      })
      .catch((err)=>{
        console.log("email promise not resolved");
          reject(new Error(err));
      })})

    // check for existing email
    Promise.all([existUsername, existEmail])
      .then(() => {
        console.log("promise resolve hua hai")
        if (password) {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              const user = new userModel({
                username,
                password: hashedPassword,
                profile: profile || "",
                email,
              });

              user
                .save()
                .then((result) =>
                  res
                    .status(201)
                    .send({ msg: "user has registered sucessfully" })
                )
                .catch((error) => res.status(500).send({ error }));
            })
            .catch((error) =>
              res
                .status(500)
                .send({ error: "Unable to hash password for some reason" })
            );
        }
      })
      .catch((error) => {
        console.log("promise resolve nahi hua");
        return res.status(500).send({ error });
      });
  } catch (error) {
    return res.status(500).send(error);
  }
}

/** POST: http://localhost:8080/api/login
* @param: {
"username" : "example123",
"password" : "admin123"
}
*/
export async function login(req,res){

  const { username, password } = req.body;

  try {

      userModel.findOne({ username })
          .then(user => {
              bcrypt.compare(password, user.password)
                  .then(passwordCheck => {

                      if(!passwordCheck) return res.status(400).send({ error: "Don't have Password"});

                      // create jwt token
                      const token = jwt.sign({
                                      userId: user._id,
                                      username : user.username
                                  }, ENV.JWT_SECRET , { expiresIn : "24h"});

                      return res.status(200).send({
                          msg: "Login Successful...!",
                          username: user.username,
                          token
                      });

                  })
                  .catch(error =>{
                      return res.status(400).send({ error: "Password does not Match"})
                  })
          })
          .catch( error => {
              return res.status(404).send({ error : "Username not Found"});
          })

  } catch (error) {
      return res.status(500).send({ error});
  }
}

/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
  res.json("getUser route");
}

/** PUT: http://localhost:8080/api/updateuser
* @param: {
"id" : "<userid>"
}
body: {
  firstName: '',
  address : '',
  profile : ''
}
*/
export async function updateUser(req, res) {
  res.json("updateUser route");
}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
  res.json("generateOTP route");
}

/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
  res.json("verifyOTP route");
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
  res.json("createResetSession route");
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
  res.json("resetPassword route");
}
