import express from "express";
import { authRequired } from "../middleware/auth.js";
import { getAllCredits, addCreditCard, updateCard, deleteCard, setDefault } from "../controllers/creditController.js";
export 
const router = express.Router();

router.get("/", authRequired, getAllCredits);
router.post("/", authRequired, addCreditCard);
router.put("/:cardId", authRequired, updateCard);
router.delete("/:cardId", authRequired, deleteCard);
router.put("/:cardId/default", authRequired, setDefault);

export default router;