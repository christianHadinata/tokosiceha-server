import * as cartService from "../services/cart.js";
import { BadRequestError } from "../errors/BadRequestError.js";

export const getUserCart = async (req, res) => {
  const { user_id } = req.params;

  const result = await cartService.getUserCart(user_id);

  return res.json(result);
};

export const insertNewCartItem = async (req, res) => {
  const { user_id } = req.params;

  const { product_id } = req.body;

  if (!product_id) {
    throw new BadRequestError("Product id must be included");
  }

  const result = await cartService.insertNewCartItem({ user_id, product_id });

  return res.json(result);
};

export const updateCartItem = async (req, res) => {
  const { user_id } = req.params;

  const { product_id, product_quantity } = req.body;

  if (!product_id || !product_quantity) {
    throw new BadRequestError(
      "Product id and product quantity must be included"
    );
  }

  const result = await cartService.updateCartItem(null, {
    user_id,
    product_id,
    product_quantity,
  });

  return res.json(result);
};

export const removeCartItem = async (req, res) => {
  const { user_id, product_id } = req.params;

  const result = await cartService.removeCartItem(null, {
    user_id,
    product_id,
  });

  return res.json(result);
};

export const clearCart = async (req, res) => {
  const { user_id } = req.params;

  const result = await cartService.clearCart(user_id);

  return res.json(result);
};
