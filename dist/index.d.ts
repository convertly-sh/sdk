export type ConvertlyInput = Blob | ArrayBuffer | Uint8Array | Buffer | string;
export type ConvertlyFileInput = {
    file?: ConvertlyInput;
    sourceUrl?: string;
    filename?: string;
    contentType?: string;
};
export type ConvertlyClientOptions = {
    apiKey: string;
    baseUrl?: string;
    fetch?: typeof fetch;
};
export type ConvertOptions = ConvertlyFileInput & {
    format: string;
    compression?: string;
    resize?: string;
    resizeWidth?: number;
    resizeHeight?: number;
    autoOrient?: boolean;
    saveToStorage?: boolean;
};
export type CompressOptions = ConvertlyFileInput & {
    mode?: "quality" | "target-size";
    quality?: number;
    targetBytes?: number;
    lossless?: boolean;
    stripMetadata?: boolean;
    saveToStorage?: boolean;
};
export type MediaToolOptions = ConvertlyFileInput & {
    async?: boolean;
    background?: boolean;
    [key: string]: unknown;
};
export type WaitOptions = {
    intervalMs?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
};
export type ConvertlyResponse<T = unknown> = T;
export declare class ConvertlyError extends Error {
    status: number;
    body: unknown;
    constructor(message: string, status: number, body: unknown);
}
export declare class Convertly {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly fetcher;
    constructor(options: ConvertlyClientOptions);
    media: {
        convert: <T = unknown>(options: ConvertOptions) => Promise<T>;
        compress: <T = unknown>(options: CompressOptions) => Promise<T>;
        thumbnail: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        pdfPreview: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        imageToPdf: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        stripMetadata: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        posterFrame: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        extractAudio: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        watermark: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        inspect: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        trim: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        gif: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        storyboard: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        transform: <T = unknown>(options: MediaToolOptions) => Promise<T>;
    };
    jobs: {
        get: <T = unknown>(jobId: string) => Promise<T>;
        list: <T = unknown>() => Promise<T>;
        cancel: <T = unknown>(jobId: string) => Promise<T>;
        wait: <T extends {
            status?: string;
        } = {
            status?: string;
        }>(jobId: string, options?: WaitOptions) => Promise<T>;
    };
    private convert;
    private compress;
    private mediaTool;
    private waitForJob;
    private request;
}
export declare function createConvertly(options: ConvertlyClientOptions): Convertly;
