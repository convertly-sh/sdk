import { toBlob } from "./internal/form.js";
import { createStorageClient } from "./storage.js";
import type { CompressOptions, ConvertlyClientOptions, ConvertlyPlayerOptions, ConvertOptions, MediaToolOptions, SignedTransformOptions, TransferOptions, WaitOptions } from "./types.js";
import { createVideoStreamsClient } from "./video-streams.js";
export type { CompleteUploadBody, CompressOptions, ConvertlyClientOptions, ConvertlyFileInput, ConvertlyInput, ConvertlyPlayerOptions, ConvertOptions, CreateFolderOptions, CreateUploadSessionOptions, ListFilesOptions, ListFoldersOptions, MediaToolOptions, SignedTransformOptions, StoredFileRecord, StoredFolderRecord, TransferOptions, UpdateFileOptions, UpdateFolderOptions, UploadFileOptions, UploadSession, UploadStrategy, VideoCaptionTrackInput, VideoChapterInput, VideoStreamOptions, VideoStreamUpdateOptions, WaitOptions, } from "./types.js";
export { ConvertlyError } from "./errors.js";
export type { ConvertlyStorageClient } from "./storage.js";
export type { ConvertlyVideoStreamsClient } from "./video-streams.js";
export declare class Convertly {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly fetcher;
    readonly storage: ReturnType<typeof createStorageClient>;
    readonly video: {
        streams: ReturnType<typeof createVideoStreamsClient>;
    };
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
    private convert;
    private compress;
    private transfer;
    private mediaTool;
    private waitForJob;
    private request;
}
export declare function createConvertly(options: ConvertlyClientOptions): Convertly;
export { createConvertlyCdn, defaultWidths, type ConvertlyCdn, type ConvertlyCdnConfig, type ConvertlyFormat, type ConvertlyFit, type ConvertlyGravity, type ConvertlyPosterTransform, type ConvertlyTransform, type ConvertlyVideoFormat, type ConvertlyVideoTransform, } from "@convertly-sh/image";
/** @deprecated Prefer `@convertly-sh/player` for HLS playback with controls and branding. */
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
export { toBlob };
