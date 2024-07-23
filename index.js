//configuration et schema
const express = require("express");
const cosrs = require("cors");
const upload = require('express-fileupload')
require("dotenv").config();

const {connect} = require("mongoose")
// la connexion a la base de donnée
// mongoose.connect(config.connectionString);


const userRoute  = require("./routes/userRoute");
const postRoutes  = require("./routes/postRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");


const app = express();
app.use(express.json({ extended:true}))
app.use(express.urlencoded({extended:true}))
app.use(cosrs({credentials:true, origin:"http://localhost:3000"}))
app.use(upload())
app.use('/uploads', express.static(__dirname + '/uploads'))

app.use("/api/users", userRoute)
app.use("/api/posts", postRoutes)
app.use(notFound)
app.use(errorHandler)
connect(process.env.MONGO_URI).then(app.listen(process.env.PORT || 5000, 
  () => console.log(`Server bien demarré au port ${process.env.PORT}`))).catch(error=> {console.log(error)})

// app.listen(5000, () => {
//   console.log(`Server bien demarré sans faille au port http://localhost:${port}`
//   );
// });
