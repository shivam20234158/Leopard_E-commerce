import {addToCart,removeAllFromCart,getCartProducts,updateQuantity} from "../controllers/cart.controller.js"; 
import { protectRoute} from "../middleware/auth.middleware.js";

import express from "express";

const router=express.Router();

router.post("/",protectRoute,addToCart);
router.delete("/",protectRoute,removeAllFromCart);
router.get("/",protectRoute,getCartProducts);
router.put("/:id",protectRoute,updateQuantity);

export default router;