import { User, RegisterDto, UserResponse } from "../models/User";
export interface IUserRepository {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: RegisterDto): Promise<User>;
    delete(id: string): Promise<boolean>;
}
declare class SqliteUserRepository implements IUserRepository {
    private getDb;
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: RegisterDto): Promise<User>;
    delete(id: string): Promise<boolean>;
    private rowToUser;
    toUserResponse(user: User): UserResponse;
}
export declare const userRepository: SqliteUserRepository;
export {};
//# sourceMappingURL=UserRepository.d.ts.map