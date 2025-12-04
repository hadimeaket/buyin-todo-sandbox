/**
 * Attachment Routes
 *
 * Defines HTTP routes for file attachment management
 * All routes require authentication
 */

import { Router } from "express";
import {
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment,
  handleUploadError,
} from "../controllers/attachmentController";
import { authMiddleware } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

// Apply auth middleware to all attachment routes
router.use(authMiddleware);

// POST /api/todos/:id/attachments - Upload file
router.post(
  "/:id/attachments",
  upload.single("file"),
  handleUploadError,
  uploadAttachment
);

// GET /api/todos/:id/attachments - Get all attachments
router.get("/:id/attachments", getAttachments);

// GET /api/todos/:id/attachments/:attachmentId - Download attachment
router.get("/:id/attachments/:attachmentId", downloadAttachment);

// DELETE /api/todos/:id/attachments/:attachmentId - Delete attachment
router.delete("/:id/attachments/:attachmentId", deleteAttachment);

export default router;
