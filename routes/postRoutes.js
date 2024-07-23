const { Router } = require("express");
const {
  createPost,
  getPosts,
  getPost,
  getUserPosts,
  editPost,
  deletePost,
} = require("../controllers/postControllers");
const authMiddleWare = require("../middleware/authMiddleware");
const router = Router();

router.post("/", authMiddleWare, createPost);
router.get("/", getPosts);
router.get("/:id", getPost);
router.get("/users/:id", getUserPosts);
router.patch("/:id", authMiddleWare, editPost);
router.delete("/:id", authMiddleWare, deletePost);
//"_id": "669c54e789852a083ac8321e", l id du post

module.exports = router;
