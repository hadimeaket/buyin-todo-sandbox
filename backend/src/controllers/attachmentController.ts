import { Request, Response } from "express";
import { attachmentService } from "../services/AttachmentService";
import * as fs from "fs";

interface AuthRequest extends Request {
  userId?: string;
}

export const uploadAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { todoId } = req.params;
    const userId = req.userId!;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const attachment = await attachmentService.uploadAttachment(
      todoId,
      userId,
      file
    );

    return res.status(201).json(attachment);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Failed to upload attachment" });
  }
};

export const getAttachmentsByTodoId = async (req: AuthRequest, res: Response) => {
  try {
    const { todoId } = req.params;
    const userId = req.userId!;

    const attachments = await attachmentService.getAttachmentsByTodoId(
      todoId,
      userId
    );

    return res.json(attachments);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return res.status(404).json({ error: error.message });
      }
    }
    return res.status(500).json({ error: "Failed to fetch attachments" });
  }
};

export const downloadAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const { attachment, filePath } = await attachmentService.getAttachmentById(
      id,
      userId
    );

    // Set appropriate headers
    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${attachment.originalName}"`
    );
    res.setHeader("Content-Length", attachment.size.toString());

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    return;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Access denied")) {
        return res.status(403).json({ error: error.message });
      }
    }
    return res.status(500).json({ error: "Failed to download attachment" });
  }
};

export const deleteAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const success = await attachmentService.deleteAttachment(id, userId);

    if (success) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ error: "Attachment not found" });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Access denied")) {
        return res.status(403).json({ error: error.message });
      }
    }
    return res.status(500).json({ error: "Failed to delete attachment" });
  }
};
