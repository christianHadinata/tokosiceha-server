import express from "express";
import {
  register,
  login,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} from "../controllers/user.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", getAllUsers);
router.get("/:user_id", getSingleUser);
router.patch("/:user_id", updateUser);
router.delete("/:user_id", deleteUser);

export default router;
