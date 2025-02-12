import { BadRequestError } from "../errors/BadRequestError.js";
import * as productService from "../services/product.js";

export const getAllProducts = async (req, res) => {
  const products = await productService.getAllProducts();
  return res.json(products);
};

export const getSingleProduct = async (req, res) => {
  const { product_id } = req.params;

  const product = await productService.getSingleProduct(product_id);

  return res.json(product);
};

export const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      product_price,
      product_stock,
      product_details,
      category_id,
    } = req.body;

    console.log("pname " + product_name);

    if (
      !product_name ||
      !product_price ||
      !product_stock ||
      !product_details ||
      !category_id
    ) {
      throw new BadRequestError("All field must be specified");
    }

    if (!req.files || !req.files["featured_image"]) {
      return res.status(400).json({ message: "Featured image is required" });
    }

    const featuredImage = req.files["featured_image"][0].filename;
    // if additional images dont exist, set it into empty arr []
    const additionalImages = req.files["images"]
      ? req.files["images"].map((file) => file.filename)
      : [];

    const result = await productService.createProduct({
      product_name,
      product_price,
      product_stock,
      product_details,
      category_id,
      product_featured_image_url: featuredImage,
      additionalImages,
    });

    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { product_id } = req.params;

  const {
    product_name,
    product_price,
    product_stock,
    product_details,
    category_id,
  } = req.body;

  const featuredImage = req.files["featured_image"][0].filename;

  const result = await productService.updateProduct({
    product_id,
    product_name,
    product_price,
    product_stock,
    product_details,
    category_id,
    product_featured_image_url: featuredImage,
    additionalImages,
  });

  return res.json({ success: true, ...result });
};

export const deleteProduct = async (req, res) => {
  const { product_id } = req.params;

  await productService.deleteProduct(product_id);

  return res.json({ success: true });
};

export const addProductImages = async (req, res) => {
  const { product_id } = req.params;

  const additionalImages = req.files["images"]
    ? req.files["images"].map((file) => file.filename)
    : [];

  const result = await productService.addProductImages(
    product_id,
    additionalImages
  );

  return res.json({ success: true, ...result });
};

export const getAdditionalProductImages = async (req, res) => {
  const { product_id } = req.params;

  const result = await productService.getAdditionalProductImages(product_id);

  return res.json(result);
};

export const deleteProductImage = async (req, res) => {
  const { product_image_id } = req.body;

  await productService.deleteProductImage(product_image_id);

  return res.json({ success: true });
};

export const getAllCategories = async (req, res) => {
  const categories = await productService.getAllCategories();

  return res.json(categories);
};
