import type { Response } from "express";
import multer from "multer";
import type { AuthRequest } from "../middleware/auth";
import type { AttachmentService } from "../services/AttachmentService";

// Configure multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadMiddleware = upload.single("file");

export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  uploadAttachment = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const { todoId } = req.body;
      const userId = req.userId!;

      if (!todoId) {
        res.status(400).json({ error: "Todo ID is required" });
        return;
      }

      const attachment = await this.attachmentService.createAttachment(
        todoId,
        userId,
        req.file
      );

      res.status(201).json(attachment);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to upload attachment" });
      }
    }
  };

  getAttachmentsByTodo = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { todoId } = req.params;
      const attachments = this.attachmentService.getAttachmentsByTodoId(todoId);

      res.json(attachments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attachments" });
    }
  };

  downloadAttachment = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const attachment = this.attachmentService.getAttachmentById(id);

      if (!attachment) {
        res.status(404).json({ error: "Attachment not found" });
        return;
      }

      const filePath = this.attachmentService.getFilePath(attachment);
      
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${attachment.originalName}"`
      );
      res.setHeader("Content-Type", attachment.mimeType);
      
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ error: "Failed to download attachment" });
    }
  };

  deleteAttachment = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const deleted = await this.attachmentService.deleteAttachment(id, userId);

      if (!deleted) {
        res.status(404).json({ error: "Attachment not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized to delete this attachment") {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to delete attachment" });
      }
    }
  };
}
