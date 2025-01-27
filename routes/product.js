import express from "express";
import {
  getAllProducts,
  getSingleProduct,
  deleteProduct,
  createProduct,
} from "../controllers/product.js";

import { fileUpload } from "../middleware/fileUploader.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:product_id", getSingleProduct);
router.post("/", fileUpload("./public"), createProduct);
// router.patch("/:product_id", updateProduct);
router.delete("/:product_id", deleteProduct);

export default router;
