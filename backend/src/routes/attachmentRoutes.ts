import { Router } from "express";
import { AttachmentController, uploadMiddleware } from "../controllers/attachmentController";
import { authenticate } from "../middleware/auth";
import type { AttachmentService } from "../services/AttachmentService";

export function createAttachmentRoutes(
  attachmentService: AttachmentService
): Router {
  const router = Router();
  const controller = new AttachmentController(attachmentService);

  // All attachment routes require authentication
  router.use(authenticate);

  // Upload attachment to a todo
  router.post("/", uploadMiddleware, controller.uploadAttachment);

  // Get all attachments for a todo
  router.get("/todo/:todoId", controller.getAttachmentsByTodo);

  // Download an attachment
  router.get("/:id/download", controller.downloadAttachment);

  // Delete an attachment
  router.delete("/:id", controller.deleteAttachment);

  return router;
}
