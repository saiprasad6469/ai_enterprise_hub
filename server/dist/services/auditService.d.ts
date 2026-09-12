import { Request } from 'express';
export declare const auditService: {
    log(req: Request, action: string, target: string, status?: "Success" | "Failed"): Promise<void>;
};
//# sourceMappingURL=auditService.d.ts.map