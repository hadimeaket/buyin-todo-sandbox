import { Router } from "express";
import { upload } from "../middleware/upload";
import {
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
} from "../controllers/attachmentController";

const router = Router();

// Upload attachment to a todo
router.post("/:todoId/attachments", upload.single("file"), uploadAttachment);

// Download an attachment
router.get("/:todoId/attachments/:attachmentId", downloadAttachment);

// Delete an attachment
router.delete("/:todoId/attachments/:attachmentId", deleteAttachment);

export default router;
