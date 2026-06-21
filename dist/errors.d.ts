export declare class ConvertlyError extends Error {
    status: number;
    body: unknown;
    constructor(message: string, status: number, body: unknown);
}
