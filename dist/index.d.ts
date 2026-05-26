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
    mono?: boolean;
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
export type SignedTransformOptions = {
    sourceUrl: string;
    preset?: "ecommerce" | "avatar" | "blog-hero" | "social-preview";
    width?: number;
    height?: number;
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    format?: "jpg" | "png" | "webp" | "avif";
    quality?: number;
    expiresIn?: number;
};
export type VideoCaptionTrackInput = {
    label: string;
    language: string;
    kind?: "subtitles" | "captions";
    content: string;
};
export type VideoStreamOptions = {
    sourceFileId: string;
    profile?: "basic" | "standard" | "hd" | "source_max" | "custom";
    packageFormats?: Array<"hls" | "dash">;
    renditions?: Array<{
        height: number;
        bitrate: number;
        audioBitrate?: number;
    }>;
    segmentDuration?: number;
    access?: "public" | "signed";
    tokenTtlSeconds?: number;
    allowedDomains?: string[];
    captions?: VideoCaptionTrackInput[];
    clip?: {
        start?: number;
        end?: number;
        duration?: number;
        mode?: "accurate" | "fast";
    } | null;
};
export type LiveInputOptions = {
    name?: string;
    recordMode?: "off" | "automatic";
    reconnectWindowSeconds?: number;
    requireSignedPlayback?: boolean;
    allowedDomains?: string[];
};
export type LiveInputUpdateOptions = Partial<LiveInputOptions> & {
    enabled?: boolean;
};
export type ConvertlyPlayerOptions = {
    video: HTMLVideoElement;
    playbackId: string;
    manifestUrl?: string;
    posterUrl?: string | null;
    captions?: Array<{
        url: string;
        label: string;
        language: string;
        kind?: "subtitles" | "captions";
    }>;
    baseUrl?: string;
    fetch?: typeof fetch;
    analytics?: boolean;
};
export type TransferOptions = {
    sourceUrl?: string;
    destination?: "download" | "convertly-storage";
    filename?: string;
    contentType?: string;
    async?: boolean;
    extract?: boolean;
    extractOptions?: {
        preservePaths?: boolean;
        folderName?: string;
        targetFolderId?: string | null;
        maxFiles?: number;
        maxEntryBytes?: number;
        maxTotalBytes?: number;
    };
    cloudSource?: {
        provider: "google-drive" | "s3" | "dropbox";
        fileId?: string;
        folderId?: string;
        bucket?: string;
        key?: string;
        prefix?: string;
        region?: string;
        endpoint?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        sessionToken?: string;
        accessToken?: string;
        path?: string;
        recursive?: boolean;
        targetFolderId?: string | null;
    };
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
        removeBackground: <T = unknown>(options: MediaToolOptions) => Promise<T>;
        transfer: <T = ArrayBuffer>(options: TransferOptions) => Promise<T>;
        signedTransform: <T = {
            url: string;
            expiresAt: string;
        }>(options: SignedTransformOptions) => Promise<T>;
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
    video: {
        streams: {
            create: <T = unknown>(options: VideoStreamOptions) => Promise<T>;
            list: <T = unknown>(params?: {
                limit?: number;
                offset?: number;
                status?: string;
            }) => Promise<T>;
            get: <T = unknown>(id: string) => Promise<T>;
            delete: <T = unknown>(id: string) => Promise<T>;
        };
    };
    live: {
        inputs: {
            create: <T = unknown>(options?: LiveInputOptions) => Promise<T>;
            list: <T = unknown>() => Promise<T>;
            get: <T = unknown>(id: string) => Promise<T>;
            update: <T = unknown>(id: string, options: LiveInputUpdateOptions) => Promise<T>;
            rotateKey: <T = unknown>(id: string) => Promise<T>;
            delete: <T = unknown>(id: string) => Promise<T>;
        };
    };
    private convert;
    private compress;
    private transfer;
    private mediaTool;
    private waitForJob;
    private request;
}
export declare function createConvertly(options: ConvertlyClientOptions): Convertly;
export declare class ConvertlyPlayer {
    private readonly video;
    private readonly playbackId;
    private readonly baseUrl;
    private readonly fetcher;
    private readonly analytics;
    private readonly sessionId;
    private lastProgressAt;
    constructor(options: ConvertlyPlayerOptions);
    destroy(): void;
    private bindAnalytics;
}
