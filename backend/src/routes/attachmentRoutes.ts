import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  getAttachmentsByTodoId,
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
} from "../controllers/attachmentController";

const router = Router();

// Get all attachments for a todo
router.get(
  "/todos/:todoId/attachments",
  authMiddleware,
  getAttachmentsByTodoId
);

// Upload attachment to a todo
router.post(
  "/todos/:todoId/attachments",
  authMiddleware,
  upload.single("file"),
  uploadAttachment
);

// Download an attachment
router.get("/attachments/:id/download", authMiddleware, downloadAttachment);

// Delete an attachment
router.delete("/attachments/:id", authMiddleware, deleteAttachment);

export default router;
