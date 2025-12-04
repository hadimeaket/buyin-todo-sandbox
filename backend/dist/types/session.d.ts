import "express-session";
declare module "express-session" {
    interface SessionData {
        userId: string;
        email: string;
    }
}
//# sourceMappingURL=session.d.ts.map