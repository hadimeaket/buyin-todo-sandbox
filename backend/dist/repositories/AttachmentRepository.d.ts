import { Attachment } from "../models/Todo";
export interface IAttachmentRepository {
    findByTodoId(todoId: string): Promise<Attachment[]>;
    findById(id: string): Promise<Attachment | null>;
    create(todoId: string, filename: string, originalName: string, mimeType: string, size: number): Promise<Attachment>;
    delete(id: string): Promise<boolean>;
    deleteByTodoId(todoId: string): Promise<void>;
}
declare class SQLiteAttachmentRepository implements IAttachmentRepository {
    constructor();
    private initTable;
    findByTodoId(todoId: string): Promise<Attachment[]>;
    findById(id: string): Promise<Attachment | null>;
    create(todoId: string, filename: string, originalName: string, mimeType: string, size: number): Promise<Attachment>;
    delete(id: string): Promise<boolean>;
    deleteByTodoId(todoId: string): Promise<void>;
}
export declare const attachmentRepository: SQLiteAttachmentRepository;
export {};
//# sourceMappingURL=AttachmentRepository.d.ts.map