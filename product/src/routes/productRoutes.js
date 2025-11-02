const express = require("express");
const ProductController = require("../controllers/productController");
const isAuthenticated = require("../utils/isAuthenticated");

const router = express.Router();
const productController = new ProductController();

router.post("/", isAuthenticated, productController.createProduct);
router.post("/buy", isAuthenticated, productController.createOrder);
router.get("/", isAuthenticated, productController.getProducts);
<<<<<<< HEAD
router.get("/:id", isAuthenticated, productController.getProductById);
=======

>>>>>>> 72a0403eaeb1263f547bc321085b38ea757eb449
module.exports = router;
