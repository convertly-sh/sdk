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
export type VideoStreamUpdateOptions = {
    title?: string;
    description?: string;
    tags?: string[];
    engagement?: Record<string, unknown>;
};
export type VideoChapterInput = {
    title: string;
    start: number;
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
export type StoredFileRecord = {
    id: string;
    filename: string;
    mime_type: string;
    size_bytes: number;
    folder_id: string | null;
    cdn_slug?: string | null;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
    metadata?: Record<string, unknown> | null;
    created_at?: string;
    download_url?: string;
    downloadUrl?: string;
};
export type StoredFolderRecord = {
    id: string;
    name: string;
    color: string;
    parent_id: string | null;
    created_at?: string;
};
export type ListFilesOptions = {
    folderId?: string | null;
    limit?: number;
    offset?: number;
    search?: string;
    mimePrefix?: string;
    wordpressInstance?: string;
    excludeWordpress?: boolean;
};
export type ListFoldersOptions = {
    parentId?: string | null;
    search?: string;
    wordpressInstance?: string;
    excludeWordpress?: boolean;
};
export type CreateFolderOptions = {
    name: string;
    color?: string;
    parentId?: string | null;
    wordpressInstanceId?: string;
};
export type UpdateFolderOptions = {
    name?: string;
    parentId?: string | null;
};
export type UpdateFileOptions = {
    filename?: string;
    cdnSlug?: string | null;
    description?: string;
    tags?: string[];
};
export type UploadStrategy = "auto" | "multipart" | "presigned";
export type UploadFileOptions = {
    file: Exclude<ConvertlyInput, string>;
    filename: string;
    contentType?: string;
    folderId?: string | null;
    /** Default `auto`: multipart under 8 MiB, presigned direct-to-storage above. */
    strategy?: UploadStrategy;
    presignedThresholdBytes?: number;
    resumable?: boolean;
};
export type CreateUploadSessionOptions = {
    filename: string;
    contentType?: string;
    sizeBytes: number;
    folderId?: string | null;
    resumable?: boolean;
};
export type UploadSession = {
    upload: {
        provider: string;
        bucket: string;
        path: string;
        signedUrl: string;
        token?: string;
        method: string;
        expiresInSeconds: number;
    };
    resumable: unknown;
    complete: {
        url: string;
        body: {
            path: string;
            filename: string;
            contentType: string;
            sizeBytes: number;
            folderId: string | null;
            provider?: string;
            bucket?: string;
        };
    };
};
export type CompleteUploadBody = UploadSession["complete"]["body"];
export type RequestFn = <T>(path: string, init?: RequestInit) => Promise<T>;
