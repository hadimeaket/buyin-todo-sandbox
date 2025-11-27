import { Request, Response } from "express";
import attachmentService from "../services/AttachmentService";

export const getAttachmentsByTodoId = async (req: Request, res: Response) => {
  try {
    const { todoId } = req.params;
    const userId = (req as any).userId;

    const attachments = await attachmentService.getAttachmentsByTodoId(
      todoId,
      userId
    );
    res.json(attachments);
  } catch (error: any) {
    if (error.message === "Todo not found or access denied") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to fetch attachments" });
    }
  }
};

export const uploadAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { todoId } = req.params;
    const userId = (req as any).userId;
    const file = (req as any).file;

    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const attachment = await attachmentService.createAttachment(
      todoId,
      userId,
      file
    );
    res.status(201).json(attachment);
  } catch (error: any) {
    console.error("Upload attachment error:", error);
    if (error.message === "Todo not found or access denied") {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("Invalid file type")) {
      res.status(400).json({ error: error.message });
    } else if (error.message.includes("File too large")) {
      res.status(400).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to upload attachment", details: error.message });
    }
  }
};

export const downloadAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const attachment = await attachmentService.getAttachmentById(id, userId);

    res.download(attachment.filePath, attachment.originalFilename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ error: "Failed to download file" });
      }
    });
  } catch (error: any) {
    if (
      error.message === "Attachment not found" ||
      error.message === "Access denied"
    ) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to download attachment" });
    }
  }
};

export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    await attachmentService.deleteAttachment(id, userId);
    res.status(204).send();
  } catch (error: any) {
    if (
      error.message === "Attachment not found" ||
      error.message === "Access denied"
    ) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to delete attachment" });
    }
  }
};
