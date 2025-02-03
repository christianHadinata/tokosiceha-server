import express from "express";
import {
  getAllProducts,
  getSingleProduct,
  deleteProduct,
  createProduct,
  updateProduct,
  addProductImages,
  deleteProductImage,
} from "../controllers/product.js";

import { fileUpload } from "../middleware/fileUploader.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:product_id", getSingleProduct);
router.post("/", fileUpload("./public"), createProduct);
router.patch("/:product_id", updateProduct);
router.delete("/:product_id", deleteProduct);
router.post("/:product_id", fileUpload("./public"), addProductImages);
router.delete("/:product_id", deleteProductImage);

export default router;
