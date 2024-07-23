const Post = require("../models/postModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");

//Creer un post
const createPost = async (req, res, next) => {
  try {
    let { title, contenu, source } = req.body;
    if (!title || !contenu || !source || !req.files) {
      return next(
        new HttpError(
          "Charger une  image et remplir aussi les champs vides",
          422
        )
      );
    }

    const { thumbnail } = req.files;
    // Vefier la taille
    if (thumbnail.size > 2000000) {
      return next(
        new HttpError("La taille de votre imag est ne peut etre supproter")
      );
    }

    let filename = thumbnail.name;
    let splittedFilename = filename.split(".");
    // console.log("splittedFilename : ", splittedFilename);

    let newFilename =
      splittedFilename[0] +
      uuid() +
      "." +
      splittedFilename[splittedFilename.length - 1];
    // console.log("newFilename : ", newFilename);
    thumbnail.mv(
      path.join(__dirname, "..", "/uploads", newFilename),
      async (err) => {
        if (err) {
          return next(new HttpError(err));
        } else {
          const newPost = await Post.create({
            title,
            contenu,
            source,
            thumbnail: newFilename,
            creator: req.user.id,
          });
          if (!newPost) {
            return next(
              new HttpError(
                "Le post a besoin de bonne informations pour etre publié",
                422
              )
            );
          }

          // Verification du nombre de post de l utilisateur pour incrementer

          const currentUser = await User.findById(req.user.id);

          const userPostCount = currentUser.posts + 1;
          await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
          res.status(201).json(newPost);
        }
      }
    );
  } catch (error) {}
};

//Creer un post
const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ updatedAt: -1 });
    res.status(202).json(posts);
  } catch (error) {
    console.log(error);
    return next(new HttpError(error));
  }
};

//Creer un post
const getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      console.log(error);
      return next(new HttpError("Erreur: post non trouvé", 404));
    }

    res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return next(new HttpError(error));
  }
};




//Recuperer les posts crées  par les autheurs
const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    return next(new HttpError(error));
  }
};

// modfier post avec protection: seul autheur du post pour modifier
const editPost = async (req, res, next) => {
  try {
    let filename;
    let newFilename;
    let updatedPost;
    const postId = req.params.id;
    let { title, contenu, source } = req.body;
    if (!title || !source || (contenu.length < 12)) {
      return next(new HttpError("Les champs sont requis", 422));
    }
    if (!req.files) {
      console.log("I image st vide ?");
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { title, contenu, source },
        { new: true }
      );
    } else {
      // recuperation depuis la base de donnée
      const oldPost = await Post.findById(postId);
      if (req.user.id == oldPost.creator) {
        //  on remplace l image avec la nouvelle

        fs.unlink(
          path.join(__dirname, "..", "uploads", oldPost.thumbnail),
          async (err) => {
            if (err) {
              // gestion  derreur
              console.log(err);
              return next(new HttpError(err));
            }
            // la nouvelle image
          }
        );
        const { thumbnail } = req.files;
        if (thumbnail.size > 2000000) {
          return next(new HttpError("Image très élévé"));
        }

        filename = thumbnail.name;
        let splittedFilename = filename.split(".");
        newFilename =
          splittedFilename[0] +
          uuid() +
          "." +
          splittedFilename[splittedFilename.length - 1];
        thumbnail.mv(
          path.join(__dirname, "..", "uploads", newFilename),
          async (err) => {
            if (err) {
              return next(new HttpError(err));
            }
          }
        );
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { title, contenu, source, thumbnail: newFilename },
          { new: true }
        );
      }
    }

    if (!updatedPost) {
      return next(new HttpError("La mise a jour est seulement par l'autheur"));
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.log(error);
    return next(new HttpError(error));
  }
};

//Supprimer post seulement par son autheur

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      return next(
        new HttpError(
          "Post invalde assurer vous de l identifiant du poste",
          422
        )
      );
    }
    const post = await Post.findById(postId);
    const fileName = post?.thumbnail;
    if (req.user.id == post.creator) {
      // suppression de l image
      fs.unlink(
        path.join(__dirname, "..", "uploads", fileName),
        async (err) => {
          if (err) {
            console.log(err);
            return next(new HttpError(err));
          } else {
            await Post.findByIdAndDelete(postId);
            // appliquer le reduce sur l utilisateur

            const currentUser = await User.findById(req.user.id);
            const userPostCount = currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
            res.json(`Post ${postId} supprimé avec succès`);
          }
        }
      );
    } else {
      return next(
        new HttpError("Le post ne peut etre supprimer que par l autheur")
      );
    }
  } catch (error) {
    console.log(error);
    return next(new HttpError(error));
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  getUserPosts,
  editPost,
  deletePost,
};
