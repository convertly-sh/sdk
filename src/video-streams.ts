import { toBlob } from "./internal/form.js";
import type {
  RequestFn,
  VideoCaptionTrackInput,
  VideoChapterInput,
  VideoStreamOptions,
  VideoStreamUpdateOptions,
} from "./types.js";

export function createVideoStreamsClient(request: RequestFn) {
  const streamPath = (id: string) => `/api/video/streams/${encodeURIComponent(id)}`;

  return {
    create: <T = unknown>(options: VideoStreamOptions) =>
      request<T>("/api/video/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      }),

    list: <T = unknown>(params: { limit?: number; offset?: number; status?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.limit) query.set("limit", String(params.limit));
      if (params.offset) query.set("offset", String(params.offset));
      if (params.status) query.set("status", params.status);
      return request<T>(`/api/video/streams${query.size ? `?${query}` : ""}`);
    },

    get: <T = unknown>(id: string) => request<T>(streamPath(id)),

    update: <T = unknown>(id: string, options: VideoStreamUpdateOptions) =>
      request<T>(streamPath(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      }),

    delete: <T = unknown>(id: string) => request<T>(streamPath(id), { method: "DELETE" }),

    addCaptions: <T = unknown>(id: string, track: VideoCaptionTrackInput) =>
      request<T>(`${streamPath(id)}/captions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(track),
      }),

    removeCaption: <T = unknown>(id: string, captionId: string) =>
      request<T>(`${streamPath(id)}/captions?captionId=${encodeURIComponent(captionId)}`, {
        method: "DELETE",
      }),

    replaceChapters: <T = unknown>(id: string, chapters: VideoChapterInput[]) =>
      request<T>(`${streamPath(id)}/chapters`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapters }),
      }),

    removeChapter: <T = unknown>(id: string, chapterId: string) =>
      request<T>(`${streamPath(id)}/chapters?chapterId=${encodeURIComponent(chapterId)}`, {
        method: "DELETE",
      }),

    setPosterFromTime: <T = unknown>(id: string, timeSeconds: number) =>
      request<T>(`${streamPath(id)}/poster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeSeconds }),
      }),

    uploadPoster: <T = unknown>(
      id: string,
      file: Blob | ArrayBuffer | Uint8Array | Buffer,
      filename = "poster.jpg",
      contentType = "image/jpeg",
    ) => {
      const form = new FormData();
      form.append("poster", toBlob(file, contentType), filename);
      return request<T>(`${streamPath(id)}/poster`, { method: "POST", body: form });
    },

    listThumbnailCandidates: <T = unknown>(id: string) =>
      request<T>(`${streamPath(id)}/thumbnails`),
  };
}

export type ConvertlyVideoStreamsClient = ReturnType<typeof createVideoStreamsClient>;
