import { User, RegisterDto, LoginDto } from "../models/User";
export declare class AuthService {
    register(data: RegisterDto): Promise<User>;
    login(data: LoginDto): Promise<User>;
    getUserById(id: string): User | null;
}
export declare const authService: AuthService;
//# sourceMappingURL=AuthService.d.ts.map