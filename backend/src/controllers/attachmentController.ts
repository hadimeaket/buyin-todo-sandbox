/**
 * Attachment Controller
 *
 * HTTP request handlers for file attachment endpoints
 */

import { Request, Response } from "express";
import { attachmentService } from "../services/AttachmentService";
import fs from "fs";

/**
 * POST /api/todos/:id/attachments
 * Upload file attachment to todo
 */
export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id: todoId } = req.params;

    if (!req.file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }

    const attachment = await attachmentService.addAttachment(
      todoId,
      userId,
      req.file
    );

    console.log("Attachment uploaded:", {
      id: attachment.id,
      storedFilename: attachment.storedFilename,
    });
    res.status(201).json(attachment);
  } catch (error: any) {
    console.error("Error in uploadAttachment:", error);

    if (error.message === "Todo not found") {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes("permission")) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to upload attachment" });
    }
  }
};

/**
 * GET /api/todos/:id/attachments
 * Get all attachments for a todo
 */
export const getAttachments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id: todoId } = req.params;

    const attachments = await attachmentService.getAttachments(todoId, userId);
    res.status(200).json(attachments);
  } catch (error: any) {
    console.error("Error in getAttachments:", error);

    if (error.message === "Todo not found") {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes("permission")) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  }
};

/**
 * GET /api/todos/:id/attachments/:attachmentId
 * Download attachment file
 */
export const downloadAttachment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id: todoId, attachmentId } = req.params;

    const { attachment, filePath } = await attachmentService.getAttachment(
      todoId,
      attachmentId,
      userId
    );

    // Set headers for file download
    res.setHeader("Content-Type", attachment.mimetype);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(attachment.filename)}"`
    );
    res.setHeader("Content-Length", attachment.size);

    // Stream file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("error", (streamError) => {
      console.error("Error streaming file:", streamError);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to download file" });
      }
    });
  } catch (error: any) {
    console.error("Error in downloadAttachment:", error);

    if (
      error.message === "Todo not found" ||
      error.message === "Attachment not found"
    ) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes("permission")) {
      res.status(403).json({ message: error.message });
    } else if (error.message.includes("not found on disk")) {
      res.status(404).json({ message: "File not found" });
    } else {
      res.status(500).json({ message: "Failed to download attachment" });
    }
  }
};

/**
 * DELETE /api/todos/:id/attachments/:attachmentId
 * Delete attachment
 */
export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id: todoId, attachmentId } = req.params;

    await attachmentService.deleteAttachment(todoId, attachmentId, userId);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error in deleteAttachment:", error);

    if (
      error.message === "Todo not found" ||
      error.message === "Attachment not found"
    ) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes("permission")) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  }
};

/**
 * Multer error handler middleware
 */
export const handleUploadError = (
  err: any,
  _req: Request,
  res: Response,
  next: any
) => {
  if (err) {
    console.error("Upload error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        message: "File too large. Maximum size is 5MB.",
      });
      return;
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        message: 'Unexpected file field. Use "file" as the field name.',
      });
      return;
    }

    if (
      err.message.includes("Invalid file type") ||
      err.message.includes("Invalid file extension")
    ) {
      res.status(415).json({
        message: "Invalid file type. Only PNG, JPG, and PDF files are allowed.",
      });
      return;
    }

    res.status(400).json({ message: err.message || "File upload failed" });
    return;
  }

  next();
};
