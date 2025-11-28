import { RegisterDto, LoginDto, UserResponse } from "../models/User";
export declare class AuthService {
    register(data: RegisterDto): Promise<UserResponse>;
    login(data: LoginDto): Promise<UserResponse>;
    getUserById(id: string): Promise<UserResponse | null>;
}
export declare const authService: AuthService;
//# sourceMappingURL=AuthService.d.ts.map