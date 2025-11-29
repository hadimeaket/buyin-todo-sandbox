import type { Request, Response, NextFunction } from "express";
import { attachmentService } from "../services/AttachmentService";

/**
 * Upload an attachment to a todo
 * POST /api/todos/:todoId/attachments
 */
export const uploadAttachmentForTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { todoId } = req.params;
    const file = req.file;

    // Validate file exists
    if (!file) {
      res.status(400).json({
        error: "INVALID_FILE",
        message: "No file provided",
      });
      return;
    }

    const attachment = await attachmentService.addAttachment(
      userId,
      todoId,
      file
    );

    res.status(201).json(attachment);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TODO_NOT_FOUND") {
        res.status(404).json({
          error: "TODO_NOT_FOUND",
          message: "Todo not found or access denied",
        });
        return;
      }
      if (error.message === "INVALID_FILE") {
        res.status(400).json({
          error: "INVALID_FILE",
          message: "Invalid file provided",
        });
        return;
      }
    }
    next(error);
  }
};

/**
 * List all attachments for a todo
 * GET /api/todos/:todoId/attachments
 */
export const listAttachmentsForTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { todoId } = req.params;

    const attachments = await attachmentService.listAttachments(userId, todoId);

    res.status(200).json(attachments);
  } catch (error) {
    if (error instanceof Error && error.message === "TODO_NOT_FOUND") {
      res.status(404).json({
        error: "TODO_NOT_FOUND",
        message: "Todo not found or access denied",
      });
      return;
    }
    next(error);
  }
};

/**
 * Download an attachment
 * GET /api/attachments/:id/download
 */
export const downloadAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const { attachment, filePath } =
      await attachmentService.getAttachmentForDownload(userId, id);

    // Set headers for download
    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(attachment.originalName)}"`
    );
    res.setHeader("Content-Length", attachment.size);

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ATTACHMENT_NOT_FOUND") {
        res.status(404).json({
          error: "ATTACHMENT_NOT_FOUND",
          message: "Attachment not found or access denied",
        });
        return;
      }
      if (error.message === "FILE_NOT_FOUND") {
        res.status(404).json({
          error: "FILE_NOT_FOUND",
          message: "File not found on server",
        });
        return;
      }
    }
    next(error);
  }
};

/**
 * Delete an attachment
 * DELETE /api/attachments/:id
 */
export const deleteAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await attachmentService.deleteAttachment(userId, id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "ATTACHMENT_NOT_FOUND") {
      res.status(404).json({
        error: "ATTACHMENT_NOT_FOUND",
        message: "Attachment not found or access denied",
      });
      return;
    }
    next(error);
  }
};
