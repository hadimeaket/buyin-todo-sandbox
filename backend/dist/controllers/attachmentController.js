"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.getAttachments = exports.downloadAttachment = exports.uploadAttachment = void 0;
const AttachmentRepository_1 = require("../repositories/AttachmentRepository");
const TodoRepository_1 = require("../repositories/TodoRepository");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UPLOAD_DIR = path_1.default.join(__dirname, "../../uploads");
// Allowed file types and size
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const uploadAttachment = async (req, res, next) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }
        const todoId = req.params.id;
        // Check if todo exists and belongs to user
        const todo = await TodoRepository_1.todoRepository.findById(todoId, userId);
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
            fs_1.default.unlinkSync(file.path);
            res.status(400).json({
                message: "Invalid file format. Only PNG, JPG, and PDF files are allowed"
            });
            return;
        }
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            // Delete uploaded file
            fs_1.default.unlinkSync(file.path);
            res.status(400).json({
                message: "File too large. Maximum file size is 5MB"
            });
            return;
        }
        // Save attachment metadata to database
        const attachment = await AttachmentRepository_1.attachmentRepository.create(todoId, file.filename, file.originalname, file.mimetype, file.size);
        res.status(201).json(attachment);
    }
    catch (error) {
        next(error);
    }
};
exports.uploadAttachment = uploadAttachment;
const downloadAttachment = async (req, res, next) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }
        const attachmentId = req.params.attachmentId;
        // Get attachment from database
        const attachment = await AttachmentRepository_1.attachmentRepository.findById(attachmentId);
        if (!attachment) {
            res.status(404).json({ message: "Attachment not found" });
            return;
        }
        // Check if the todo belongs to the user
        const todo = await TodoRepository_1.todoRepository.findById(attachment.todoId, userId);
        if (!todo) {
            res.status(404).json({ message: "Attachment not found" });
            return;
        }
        // Check if file exists
        const filePath = path_1.default.join(UPLOAD_DIR, attachment.filename);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ message: "File not found" });
            return;
        }
        // Send file
        res.setHeader("Content-Type", attachment.mimeType);
        res.setHeader("Content-Disposition", `attachment; filename="${attachment.originalName}"`);
        res.sendFile(filePath);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadAttachment = downloadAttachment;
const getAttachments = async (req, res, next) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }
        const todoId = req.params.id;
        // Check if todo exists and belongs to user
        const todo = await TodoRepository_1.todoRepository.findById(todoId, userId);
        if (!todo) {
            res.status(404).json({ message: "Todo not found" });
            return;
        }
        const attachments = await AttachmentRepository_1.attachmentRepository.findByTodoId(todoId);
        res.status(200).json(attachments);
    }
    catch (error) {
        next(error);
    }
};
exports.getAttachments = getAttachments;
const deleteAttachment = async (req, res, next) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }
        const attachmentId = req.params.attachmentId;
        // Get attachment from database
        const attachment = await AttachmentRepository_1.attachmentRepository.findById(attachmentId);
        if (!attachment) {
            res.status(404).json({ message: "Attachment not found" });
            return;
        }
        // Check if the todo belongs to the user
        const todo = await TodoRepository_1.todoRepository.findById(attachment.todoId, userId);
        if (!todo) {
            res.status(404).json({ message: "Attachment not found" });
            return;
        }
        // Delete file from filesystem
        const filePath = path_1.default.join(UPLOAD_DIR, attachment.filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // Delete from database
        await AttachmentRepository_1.attachmentRepository.delete(attachmentId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAttachment = deleteAttachment;
//# sourceMappingURL=attachmentController.js.map