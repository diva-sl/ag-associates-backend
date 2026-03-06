import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrder,
  verifyPayment,
  getBillingHistory,
  downloadInvoice,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);

router.post("/verify-payment", protect, verifyPayment);
router.get("/history", protect, getBillingHistory);
router.get("/invoice/:id", protect, downloadInvoice);

export default router;
