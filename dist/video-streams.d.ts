import type { RequestFn, VideoCaptionTrackInput, VideoChapterInput, VideoStreamOptions, VideoStreamUpdateOptions } from "./types.js";
export declare function createVideoStreamsClient(request: RequestFn): {
    create: <T = unknown>(options: VideoStreamOptions) => Promise<T>;
    list: <T = unknown>(params?: {
        limit?: number;
        offset?: number;
        status?: string;
    }) => Promise<T>;
    get: <T = unknown>(id: string) => Promise<T>;
    update: <T = unknown>(id: string, options: VideoStreamUpdateOptions) => Promise<T>;
    delete: <T = unknown>(id: string) => Promise<T>;
    addCaptions: <T = unknown>(id: string, track: VideoCaptionTrackInput) => Promise<T>;
    removeCaption: <T = unknown>(id: string, captionId: string) => Promise<T>;
    replaceChapters: <T = unknown>(id: string, chapters: VideoChapterInput[]) => Promise<T>;
    removeChapter: <T = unknown>(id: string, chapterId: string) => Promise<T>;
    setPosterFromTime: <T = unknown>(id: string, timeSeconds: number) => Promise<T>;
    uploadPoster: <T = unknown>(id: string, file: Blob | ArrayBuffer | Uint8Array | Buffer, filename?: string, contentType?: string) => Promise<T>;
    listThumbnailCandidates: <T = unknown>(id: string) => Promise<T>;
};
export type ConvertlyVideoStreamsClient = ReturnType<typeof createVideoStreamsClient>;
