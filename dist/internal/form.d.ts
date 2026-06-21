import type { ConvertlyFileInput, ConvertlyInput } from "../types.js";
export declare function appendPrimitive(form: FormData, key: string, value: unknown): void;
export declare function toBlob(input: Exclude<ConvertlyInput, string>, contentType?: string): Blob;
export declare function appendInput(form: FormData, input: ConvertlyFileInput): void;
export declare function appendSingleInput(form: FormData, input: ConvertlyFileInput): void;
export declare function buildQuery(params: Record<string, string | number | boolean | null | undefined>): string;
