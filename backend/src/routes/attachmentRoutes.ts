import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  uploadAttachment,
  getAttachmentsByTodoId,
  downloadAttachment,
  deleteAttachment,
} from "../controllers/attachmentController";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Upload attachment for a specific todo
router.post(
  "/todos/:todoId/attachments",
  upload.single("file"),
  uploadAttachment
);

// Get all attachments for a todo
router.get("/todos/:todoId/attachments", getAttachmentsByTodoId);

// Download a specific attachment
router.get("/attachments/:id/download", downloadAttachment);

// Delete a specific attachment
router.delete("/attachments/:id", deleteAttachment);

export default router;
