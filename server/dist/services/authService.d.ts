import { IUser } from '../models/User';
export declare const authService: {
    seedInitialAccounts(): Promise<void>;
    register(data: {
        name: string;
        email: string;
        employeeId?: string;
        designation?: string;
        password: string;
        role?: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE" | "SuperAdmin" | "Admin" | "Employee";
        department?: string;
    }): Promise<{
        user: IUser;
        accessToken: string;
        refreshToken: string;
    }>;
    login(emailOrId: string, password: string, expectedRole?: string, expectedDepartment?: string): Promise<{
        user: IUser;
        accessToken: string;
        refreshToken: string;
    }>;
    refreshAccessToken(oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, refreshToken: string): Promise<void>;
    generateAccessToken(user: IUser): string;
    generateRefreshToken(user: IUser): string;
    sanitizeUser(user: IUser): {
        id: any;
        employeeId: any;
        name: any;
        email: any;
        role: any;
        department: any;
        designation: any;
        status: any;
        avatar: any;
        createdAt: any;
        updatedAt: any;
    };
};
//# sourceMappingURL=authService.d.ts.map