import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  uploadAttachment,
  getAttachmentsByTodoId,
  downloadAttachment,
  deleteAttachment,
} from "../controllers/attachmentController";

const router = Router();

// All routes require authentication
router.use(requireAuth);

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
