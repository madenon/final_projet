const { Router } = require("express");
const {
  registerUser,
  loginUser,
  getUser,
  changeUser,
  editlUser,
  getAuthors,
} = require("../controllers/userControllers");
const authMiddleWare = require("../middleware/authMiddleware");

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.get("/", getAuthors);
router.post("/change-avatar", authMiddleWare, changeUser);
router.patch("/edit-user", authMiddleWare, editlUser);

module.exports = router;
