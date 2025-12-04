import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} from "../controllers/todoController";
import {
  uploadAttachment,
  downloadAttachment,
  getAttachments,
  deleteAttachment,
} from "../controllers/attachmentController";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

const router = Router();

// GET all todos
router.get("/", getAllTodos);

// GET todo by id
router.get("/:id", getTodoById);

// POST create todo
router.post("/", createTodo);

// PUT update todo
router.put("/:id", updateTodo);

// PATCH toggle todo completion
router.patch("/:id/toggle", toggleTodo);

// DELETE todo
router.delete("/:id", deleteTodo);

// GET attachments for a todo
router.get("/:id/attachments", getAttachments);

// POST upload attachment to todo
router.post("/:id/attachments", upload.single("file"), uploadAttachment);

// GET download attachment
router.get("/:id/attachments/:attachmentId", downloadAttachment);

// DELETE attachment
router.delete("/:id/attachments/:attachmentId", deleteAttachment);

export default router;
