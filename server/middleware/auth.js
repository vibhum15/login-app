import jwt from 'jsonwebtoken';
import ENV from '../config.js';

export default async function Auth(req, res, next) {
  try {
    // Yahan pe hum request se 'authorization' header se token extract kar rahe hain.
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    // Ab hum JSON response mein token bhej rahe hain.
    const decodeTocken = await jwt.verify(token,ENV.JWT_SECRET);
    console.log(decodeTocken);
    req.user = decodeTocken;
    // res.json(decodeTocken);
    next();

  } catch(err) {
    // Agar kuch issue aata hai, toh hum 401 status code ke saath error message bhej rahe hain.
    res.status(401).json({err : "Authorisation failed"});
  }
}

export function localVariable(req,res,next){
   req.app.locals = {
    OTP : null,
    resetSession : false
   }
   next();
}