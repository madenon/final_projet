const jwt = require("jsonwebtoken");
const HttpErorr = require("../models/errorModel");

const authMiddleWare = async (req, res, next) => {
  const Authorization = req.headers.Authorization || req.headers.authorization;
  if (Authorization && Authorization.startsWith("Bearer")) {
    const token = Authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
      if (err) {
        console.log(err)
        return next(
          new HttpErorr("Vous n'avez aucune authorization , Invalid Token", 403)
        );
      }

      req.user = info;
      next();
    });
  } else {
    return next(new HttpErorr("Vous n'avez pas d'autorisation", 402))
  }
};

module.exports = authMiddleWare;
