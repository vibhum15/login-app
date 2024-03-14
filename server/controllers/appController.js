import userModel from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config.js";
import otpGenerator from "otp-generator";

// middleware for the user
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;

    // check the user existance
    let exist = await userModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: "Can't find User!" });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
}

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
      userModel
        .findOne({ username: username })
        .then((user) => {
          if (user) {
            // console.log("username promise not resolved");
            reject({ error: "please use unique username" });
          }
          resolve();
        })
        .catch((err) => {
          // console.log("username promise not resolved");
          reject(new Error(err));
        });
    });

    const existEmail = new Promise((resolve, reject) => {
      userModel
        .findOne({ email: email })
        .then((user) => {
          if (user) {
            // console.log("email promise not resolved");
            reject({ error: "please use unique email" });
          }
          resolve();
        })
        .catch((err) => {
          // console.log("email promise not resolved");
          reject(new Error(err));
        });
    });

    // check for existing email
    Promise.all([existUsername, existEmail])
      .then(() => {
        // console.log("promise resolve hua hai")
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
        // console.log("promise resolve nahi hua");
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

export async function login(req, res) {
  const { username, password } = req.body;

  try {
    userModel
      .findOne({ username })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then((passwordCheck) => {
            if (!passwordCheck)
              return res.status(400).send({ error: "Wrong Password" });

            // create jwt token
            const token = jwt.sign(
              {
                userId: user._id,
                username: user.username,
              },
              ENV.JWT_SECRET,
              { expiresIn: "24h" }
            );

            return res.status(200).send({
              msg: "Login Successful...!",
              username: user.username,
              token,
            });
          })
          .catch((error) => {
            return res.status(400).send({ error: "Password does not Match" });
          });
      })
      .catch((error) => {
        return res.status(404).send({ error: "Username not Found" });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
}

/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) return res.status(501).send({ error: "Invalid Username" });

    userModel
      .findOne({ username })
      .then((user) => {
        if (!user)
          return res.status(501).send({ error: "Couldn't Find the User" });

        /** remove password from user */
        // mongoose return unnecessary data with object so convert it into json
        const { password, ...rest } = Object.assign({}, user.toJSON());

        return res.status(201).send(rest);
      })
      .catch((err) => {
        if (err) return res.status(500).send({ err });
      });
  } catch (error) {
    return res.status(404).send({ error: "Cannot Find User Data" });
  }
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
  try {
    // const userId = req.query.id;
    const { userId } = req.user;
    // console.log(userId)
    if (userId) {
      const body = req.body;
      // update the data
      userModel
        .updateOne({ _id: userId }, body)
        .then((data) => {
          if (!data) {
            res.status(401).send({ error: "user not found" });
          }
          return res.status(201).send({ msg: "Record Updated...!" });
        })
        .catch((err) => {
          return res.status(401).send("inside catch of usermodel");
        });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset the OTP value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify Successsfully!" });
  }
  return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false; // allow access to this route only once
    return res.status(201).send({ msg: "access granted!" });
  }
  return res.status(440).send({ error: "Session expired!" });
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: "Session expired!" });

    const { username, password } = req.body;

    try {
      userModel.findOne({ username })
        .then((user) => {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              userModel
                .updateOne(
                  { username: user.username },
                  { password: hashedPassword }
                )
                .then((data) => {
                  req.app.locals.resetSession = false;
                  return res.status(201).send({ msg: "Record Updated...!" });
                })
                .catch((err) => {
                  if (err) throw err;
                });
            })
            .catch((e) => {
              return res.status(500).send({
                error: "Enable to hashed password",
              });
            });
        })
        .catch((error) => {
          return res.status(404).send({ error: "Username not Found" });
        });
    } catch (error) {
      return res.status(500).send({ error });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}
