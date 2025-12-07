import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/authenticate";
import {
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment,
} from "../controllers/attachmentController";

const router = Router();

// Configure multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Todo attachments routes (require authentication)
router.use(authenticate);

// Upload attachment to a todo
router.post("/todos/:todoId/attachments", upload.single("file"), uploadAttachment);

// Get all attachments for a todo
router.get("/todos/:todoId/attachments", getAttachments);

// Download an attachment
router.get("/attachments/:id/download", downloadAttachment);

// Delete an attachment
router.delete("/attachments/:id", deleteAttachment);

export default router;
