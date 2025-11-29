import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { uploadAttachment } from "../middleware/uploadMiddleware";
import * as attachmentController from "../controllers/attachmentController";

const router = Router();

// Upload attachment to a todo
router.post(
  "/todos/:todoId/attachments",
  authenticate,
  uploadAttachment,
  attachmentController.uploadAttachmentForTodo
);

// List all attachments for a todo
router.get(
  "/todos/:todoId/attachments",
  authenticate,
  attachmentController.listAttachmentsForTodo
);

// Download an attachment
router.get(
  "/attachments/:id/download",
  authenticate,
  attachmentController.downloadAttachment
);

// Delete an attachment
router.delete(
  "/attachments/:id",
  authenticate,
  attachmentController.deleteAttachment
);

export default router;
