import express from "express";
import {
  getAllProducts,
  getSingleProduct,
  deleteProduct,
  createProduct,
  updateProduct,
  addProductImages,
  deleteProductImage,
  getAllCategories,
  getAdditionalProductImages,
  getAllProductsWithKeyword,
} from "../controllers/product.js";

import { fileUpload } from "../middleware/fileUploader.js";

const router = express.Router();

router.get("/", getAllProducts);
router.post("/", fileUpload("./public"), createProduct);
router.get("/search", getAllProductsWithKeyword);
router.get("/categories", getAllCategories);
router.get("/:product_id", getSingleProduct);
router.patch("/:product_id", updateProduct);
router.delete("/:product_id", deleteProduct);
router.get("/:product_id/images", getAdditionalProductImages);
router.post("/:product_id/images", fileUpload("./public"), addProductImages);
router.delete("/:product_id/images", deleteProductImage);

export default router;
