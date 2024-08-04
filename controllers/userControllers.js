const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const User = require("../models/userModel");
const HttpErorr = require("../models/errorModel");
const path = require('path');

const fs = require('fs')
const {v4:uuid}  = require("uuid");
const { error } = require("console");
const { brotliCompress } = require("zlib");
// Creation des utilisateurs

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, password2 } = req.body;
    if (!name || !email || !password) {
      return next(new HttpErorr("tout les champs sont à remplir", 422));
    }
    const newEmail = email.toLowerCase();
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpErorr("Cet Email est déjà utilisé ", 422));
    }

    if (password.trim().length < 6) {
      return next(
        new HttpErorr("Le mot de passe doit contenir au moins 6 caractères")
      );
    }
    if (password !== password2) {
      return next(
        new HttpErorr("Les mots de passe ne sont pas indentiques", 422)
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email: newEmail,
      password:hashedPassword,
    });
    res
      .status(201)
      .json(`Utilisateur  ${newUser.email} a bien été  ajouté avec succès`);
  } catch (error) {
    console.log(error);
    return next(new HttpErorr("L'inscription impossible", 442));
  }
};

//Connexion des utilisateurs  par inscription

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(
        new HttpErorr(
          "Les champs, Email et mot de passe ne doivent pas etre vide"
        )
      );
    }
    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });
    if(!user){
      return next(new HttpErorr("Information invalide pour se connecter verifier votre email ", 422))
    }

 const compoarePassword = await bcrypt.compare(password, user.password)
 if(!compoarePassword){
  return  next(new HttpErorr(" Informations données sont invalide pour se connecter"))
 }


const {_id:id, name} = user;
const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn:"1d"})
res.status(200).json({token, id, name})


  } catch (error) {
    console.log(error);
    return next(new HttpErorr("Connexion impossible", 442));
  }
};

//Profile Utilisateur


const getUser = async (req, res, next) => {
try {
  const {id} = req.params;
  const user = await User.findById(id).select('-password');
  if(!user){
    return  next(new HttpErorr("Aucun utilisateur trouvé", 404))
  }

  res.status(200).json(user)

  
} catch (error) {
  console.log(error)
  return next(new HttpErorr(error));

  
}
};

//Changer votre avatar d utilisateur

const changeUser = async (req, res, next) => {
try {

  if(!req.files.avatar){
    return next(new HttpErorr("Veuillez utiliser les images en png , jpg jpeg et pdf", 422))
  }

  // utilsateur dans la base de donnée 
  const user = await User.findById(req.user.id)
  // oin supprime l'ancienne image : avatar et on la remplace

  if(user.avatar){
    fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) =>{
      if(err){
        return next(new HttpErorr(err))
      }

    })
  }
  const {avatar} = req.files
  // la taille de l avatar 

  if(avatar.size > 500000){
    return next(new HttpErorr("La taille de l avatar est grande que 500kb", 422))

  }
  let fileName;
  fileName = avatar.name;
  let splittedFilename = fileName.split('.')
  let newFilename = splittedFilename[0] + uuid()  + '.' + splittedFilename[splittedFilename.length -1]
  avatar.mv(path.join(__dirname, '..', 'uploads', newFilename), async(err)=>{
     if(err){
      return next(new HttpErorr(err))
     }


const updatedAvatar = await User.findByIdAndUpdate(req.user.id,{avatar:newFilename}, {new:true})
 if(!updatedAvatar){
  return next(new HttpErorr("vous ne pouvez pas laisser le champ vide", 422))
 }
 res.status(200).json(updatedAvatar)
  })
  
} catch (error) {
  console.log(error)
  return next(new HttpErorr(error))
  
}
  
  
};

//modifier les informations de l'utilisateur

const editlUser = async (req, res, next) => {
try {
  const {name,email, currentPasword, newPassword, newConfirmPassword} = req.body
  if(!name || !email || !currentPasword || !newPassword ){
    return next(new HttpErorr("Remplissez tous les champs", 422))

  }

    // utilisateur dans la base de donnée
    const user = await User.findById(req.user.id)
    if(!user){
      return networkInterfaces(new HttpErorr("Utilisateur non trouvé", 403))
  }
  
  // Verifier si email n'est pas enregistré 
  const emailExist = await User.findOne({email});
  if(emailExist && (emailExist._id  != req.user.id)){
    return next(new HttpErorr("Email existante", 422))
  }

  const validateUserPassword = await bcrypt.compare(currentPasword,user.password)
  if(!validateUserPassword){
    return next(new HttpErorr("Invalide mot de passe", 422))
  }

  // comparaison de mot de passe 
  if(newPassword !== newConfirmPassword){
    return  next(new HttpErorr("Impossible de modifier, les mots de passe non identique", 422))
  }
// hasher le mot de passe 
const salt = await bcrypt.genSalt(10)
const hashe = await bcrypt.hash(newPassword, salt)

// mettre a jour de l'utilisateurs dans  la base de donnée

const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password:hashe}, {new:true})
res.status(200).json(newInfo)
console.log("ok")
} catch (error) {
  console.log(error)
  return networkInterfaces(new HttpErorr(error))


}

};

//Recuperation des autheurs

const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find().select('-password')
    res.json(authors)

    
  } catch (error) {
    console.log(error);
    return next(new HttpErorr("Changement impossible", 442));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  changeUser,
  editlUser,
  getAuthors,
};
