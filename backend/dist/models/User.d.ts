export interface User {
    id: string;
    email: string;
    passwordHash: string;
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
export interface UserSession {
    userId: string;
    email: string;
}
//# sourceMappingURL=User.d.ts.map