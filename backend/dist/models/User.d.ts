export interface User {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface RegisterDto {
    email: string;
    password: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface UserResponse {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=User.d.ts.map