import { Request, Response, NextFunction } from "express";
import { attachmentRepository } from "../repositories/AttachmentRepository";
import { todoRepository } from "../repositories/TodoRepository";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Allowed file types and size
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const todoId = req.params.id;

    // Check if todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, userId);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const file = req.file;

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      // Delete uploaded file
      fs.unlinkSync(file.path);
      res.status(400).json({
        message:
          "Invalid file format. Only PNG, JPG, and PDF files are allowed",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      // Delete uploaded file
      fs.unlinkSync(file.path);
      res.status(400).json({
        message: "File too large. Maximum file size is 5MB",
      });
      return;
    }

    // Save attachment metadata to database
    const attachment = await attachmentRepository.create(
      todoId,
      file.filename,
      file.originalname,
      file.mimetype,
      file.size
    );

    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
};

export const downloadAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const attachmentId = req.params.attachmentId;

    // Get attachment from database
    const attachment = await attachmentRepository.findById(attachmentId);
    if (!attachment) {
      res.status(404).json({ message: "Attachment not found" });
      return;
    }

    // Check if the todo belongs to the user
    const todo = await todoRepository.findById(attachment.todoId, userId);
    if (!todo) {
      res.status(404).json({ message: "Attachment not found" });
      return;
    }

    // Check if file exists
    const filePath = path.join(UPLOAD_DIR, attachment.filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    // Send file
    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${attachment.originalName}"`
    );
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

export const getAttachments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const todoId = req.params.id;

    // Check if todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, userId);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    const attachments = await attachmentRepository.findByTodoId(todoId);
    res.status(200).json(attachments);
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const attachmentId = req.params.attachmentId;

    // Get attachment from database
    const attachment = await attachmentRepository.findById(attachmentId);
    if (!attachment) {
      res.status(404).json({ message: "Attachment not found" });
      return;
    }

    // Check if the todo belongs to the user
    const todo = await todoRepository.findById(attachment.todoId, userId);
    if (!todo) {
      res.status(404).json({ message: "Attachment not found" });
      return;
    }

    // Delete file from filesystem
    const filePath = path.join(UPLOAD_DIR, attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await attachmentRepository.delete(attachmentId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
