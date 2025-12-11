import { RegisterUserDto, LoginUserDto, AuthResponse } from "../models/User";
export declare class AuthService {
    register(data: RegisterUserDto): Promise<AuthResponse>;
    login(data: LoginUserDto): Promise<AuthResponse>;
    verifyToken(token: string): {
        userId: string;
    };
    private generateToken;
    private toUserResponse;
}
export declare const authService: AuthService;
//# sourceMappingURL=AuthService.d.ts.map