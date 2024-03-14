import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import ENV from "../config.js";

// https://ethereal.emai/create

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: ENV.EMAIL,
    pass: ENV.PASSWORD,
  },
});

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    // Appears in header & footer of e-mails
    name: "Mailgen",
    link: "https://mailgen.js/",
    // Optional product logo
    // logo: 'https://mailgen.js/img/logo.png'
  },
});

/** POST: http://localhost:8080/api/registerMail
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/

export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  // body of email
  var email = {
    body: {
      name: username,
      intro: text || "Welcome to LoginPage! We're very excited to have you on board.",
      outro:"Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  var emailBody = mailGenerator.generate(email);
  let message = {
    from :ENV.EMAIL,
    to:userEmail,
    subject:subject || "Signup Successful",
    html: emailBody
  }

  transporter.sendMail(message)
  .then(()=>{
    return res.status(201).send({msg : "mail me otp send kar diya hai"})
  })
  .catch( (err) => res.status(500).send({error : "transporter ka promise resolve nahi hua"}))

};

