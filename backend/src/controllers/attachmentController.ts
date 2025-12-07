import { Request, Response } from "express";
import { AttachmentService } from "../services/AttachmentService";
import { todoRepository } from "../repositories/TodoRepository";

const attachmentService = new AttachmentService();

/**
 * Upload attachment to a todo
 * POST /api/todos/:todoId/attachments
 */
export const uploadAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { todoId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Verify todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, userId);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    // Check if file was uploaded
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Create attachment
    const attachment = await attachmentService.createAttachment(
      todoId,
      file
    );

    res.status(201).json(attachment);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Error uploading file" });
    }
  }
};

/**
 * Get all attachments for a todo
 * GET /api/todos/:todoId/attachments
 */
export const getAttachments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { todoId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Verify todo exists and belongs to user
    const todo = await todoRepository.findById(todoId, userId);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    const attachments = await attachmentService.getAttachmentsByTodoId(todoId);
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attachments" });
  }
};

/**
 * Download an attachment
 * GET /api/attachments/:id/download
 */
export const downloadAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get attachment
    const attachment = await attachmentService.getAttachmentById(id);
    if (!attachment) {
      res.status(404).json({ message: "Attachment not found" });
      return;
    }

    // Verify the todo belongs to the user
    const todo = await todoRepository.findById(attachment.todo_id, userId);
    if (!todo) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Send file
    res.setHeader("Content-Type", attachment.mime_type);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${attachment.original_filename}"`
    );
    res.sendFile(attachment.file_path);
  } catch (error) {
    res.status(500).json({ message: "Error downloading file" });
  }
};

/**
 * Delete an attachment
 * DELETE /api/attachments/:id
 */
export const deleteAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get attachment
    const attachment = await attachmentService.getAttachmentById(id);
    if (!attachment) {
      res.status(404).json({ message: "Attachment not found" });
      return;
    }

    // Verify the todo belongs to the user
    const todo = await todoRepository.findById(attachment.todo_id, userId);
    if (!todo) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Delete attachment
    await attachmentService.deleteAttachment(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting attachment" });
  }
};
