export interface User {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
}
export interface RegisterUserDto {
    email: string;
    password: string;
}
export interface LoginUserDto {
    email: string;
    password: string;
}
export interface UserResponse {
    id: string;
    email: string;
    createdAt: Date;
}
export interface AuthResponse {
    user: UserResponse;
    token: string;
}
//# sourceMappingURL=User.d.ts.map