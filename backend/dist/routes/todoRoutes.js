"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const todoController_1 = require("../controllers/todoController");
const attachmentController_1 = require("../controllers/attachmentController");
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
// GET all todos
router.get('/', todoController_1.getAllTodos);
// GET todo by id
router.get('/:id', todoController_1.getTodoById);
// POST create todo
router.post('/', todoController_1.createTodo);
// PUT update todo
router.put('/:id', todoController_1.updateTodo);
// PATCH toggle todo completion
router.patch('/:id/toggle', todoController_1.toggleTodo);
// DELETE todo
router.delete('/:id', todoController_1.deleteTodo);
// GET attachments for a todo
router.get('/:id/attachments', attachmentController_1.getAttachments);
// POST upload attachment to todo
router.post('/:id/attachments', upload.single('file'), attachmentController_1.uploadAttachment);
// GET download attachment
router.get('/:id/attachments/:attachmentId', attachmentController_1.downloadAttachment);
// DELETE attachment
router.delete('/:id/attachments/:attachmentId', attachmentController_1.deleteAttachment);
exports.default = router;
//# sourceMappingURL=todoRoutes.js.map