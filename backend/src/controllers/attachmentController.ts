import { Request, Response } from "express";
import { todoRepository } from "../repositories/TodoRepository";
import { TodoAttachment } from "../models/Todo";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

export const uploadAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { todoId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Check if todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, req.user.id);
    if (!todo) {
      // Delete uploaded file if todo not found
      fs.unlinkSync(file.path);
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    // Create attachment record
    const attachment: TodoAttachment = {
      id: uuidv4(),
      filename: file.filename,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };

    // Add attachment to todo
    const updatedTodo = await todoRepository.addAttachment(
      todoId,
      req.user.id,
      attachment
    );

    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error("Error uploading attachment:", error);
    res.status(500).json({ message: "Failed to upload attachment" });
  }
};

export const downloadAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { todoId, attachmentId } = req.params;

    // Check if todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, req.user.id);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    // Find attachment
    const attachment = todo.attachments.find((a) => a.id === attachmentId);
    if (!attachment) {
      res.status(404).json({ message: "Attachment not found" });
      return;
    }

    // Send file
    const uploadsDir = path.join(process.cwd(), "data", "uploads");
    const filePath = path.join(uploadsDir, attachment.filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "File not found on server" });
      return;
    }

    res.download(filePath, attachment.originalFilename);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    res.status(500).json({ message: "Failed to download attachment" });
  }
};

export const deleteAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { todoId, attachmentId } = req.params;

    // Remove attachment (this also deletes the file)
    const updatedTodo = await todoRepository.removeAttachment(
      todoId,
      req.user.id,
      attachmentId
    );

    if (!updatedTodo) {
      res.status(404).json({ message: "Todo or attachment not found" });
      return;
    }

    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ message: "Failed to delete attachment" });
  }
};
