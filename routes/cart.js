import express from "express";
import {
  getUserCart,
  insertNewCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.js";

const router = express.Router();

router.get("/:user_id", getUserCart);
router.post("/:user_id", insertNewCartItem);
router.patch("/:user_id", updateCartItem);
router.delete("/:user_id/:product_id", removeCartItem);
router.delete("/:user_id", clearCart);

export default router;
