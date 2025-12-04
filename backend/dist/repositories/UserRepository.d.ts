import { User } from "../models/User";
export interface IUserRepository {
    findByEmail(email: string): User | null;
    findById(id: string): User | null;
    create(user: User): User;
    clear(): void;
}
export declare class UserRepository implements IUserRepository {
    findByEmail(email: string): User | null;
    findById(id: string): User | null;
    create(user: User): User;
    clear(): void;
    private rowToUser;
}
export declare const userRepository: UserRepository;
//# sourceMappingURL=UserRepository.d.ts.map