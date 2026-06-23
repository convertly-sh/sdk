import type { RequestFn } from "./types.js";
export type AiTagFileOptions = {
    maxTags?: number;
    merge?: boolean;
    locale?: string;
    prompt?: string;
};
export type AiTagFileResult = {
    file: {
        id: string;
        metadata: Record<string, unknown> | null;
    };
    tags: string[];
    addedTags: string[];
    addedCount: number;
    summary: string;
    embeddedInFile: boolean;
    usage: {
        units: number;
        operation: "image.tags";
    };
};
export declare function createAiClient(request: RequestFn): {
    tagFile: (fileId: string, options?: AiTagFileOptions) => Promise<AiTagFileResult>;
};
export type ConvertlyAiClient = ReturnType<typeof createAiClient>;
