import { User, RegisterUserDto } from "../models/User";
export interface IUserRepository {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: RegisterUserDto & {
        password: string;
    }): Promise<User>;
    delete(id: string): Promise<boolean>;
}
declare class SqliteUserRepository implements IUserRepository {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: RegisterUserDto & {
        password: string;
    }): Promise<User>;
    delete(id: string): Promise<boolean>;
}
export declare const userRepository: SqliteUserRepository;
export {};
//# sourceMappingURL=UserRepository.d.ts.map