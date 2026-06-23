import { ConvertlyError } from "./errors.js";
import { createAiClient } from "./ai.js";
import { createLibraryClient } from "./library.js";
import { appendInput, appendPrimitive, appendSingleInput, toBlob } from "./internal/form.js";
import { createStorageClient } from "./storage.js";
import type {
  CompressOptions,
  ConvertlyClientOptions,
  ConvertlyFileInput,
  ConvertlyPlayerOptions,
  ConvertOptions,
  MediaToolOptions,
  SignedTransformOptions,
  TransferOptions,
  WaitOptions,
} from "./types.js";
import { createVideoStreamsClient } from "./video-streams.js";

export type {
  CompleteUploadBody,
  CompressOptions,
  ConvertlyClientOptions,
  ConvertlyFileInput,
  ConvertlyInput,
  ConvertlyPlayerOptions,
  ConvertOptions,
  CreateFolderOptions,
  CreateUploadSessionOptions,
  ListFilesOptions,
  ListFoldersOptions,
  MediaToolOptions,
  SearchFilesOptions,
  SearchFilesResult,
  SignedTransformOptions,
  StoredFileRecord,
  StoredFolderRecord,
  TransferOptions,
  UpdateFileOptions,
  UpdateFolderOptions,
  UploadFileOptions,
  UploadSession,
  UploadStrategy,
  VideoCaptionTrackInput,
  VideoChapterInput,
  VideoStreamOptions,
  VideoStreamUpdateOptions,
  WaitOptions,
} from "./types.js";

export { ConvertlyError } from "./errors.js";
export type { ConvertlyStorageClient } from "./storage.js";
export type { ConvertlyVideoStreamsClient } from "./video-streams.js";
export type { ConvertlyAiClient, AiTagFileOptions, AiTagFileResult } from "./ai.js";
export type { ConvertlyLibraryClient, LibraryTaxonomyTerm, CreateTaxonomyTermOptions, UpdateTaxonomyTermOptions } from "./library.js";

const defaultBaseUrl = "https://convertly.sh";

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new Error("Aborted."));
      },
      { once: true },
    );
  });
}

export class Convertly {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  readonly storage: ReturnType<typeof createStorageClient>;
  readonly library: ReturnType<typeof createLibraryClient>;
  readonly ai: ReturnType<typeof createAiClient>;
  readonly video: { streams: ReturnType<typeof createVideoStreamsClient> };

  constructor(options: ConvertlyClientOptions) {
    if (!options.apiKey) throw new Error("Convertly API key is required.");
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? defaultBaseUrl).replace(/\/$/, "");
    this.fetcher = options.fetch ?? fetch;
    this.storage = createStorageClient(this.request.bind(this), this.fetcher);
    this.library = createLibraryClient(this.request.bind(this));
    this.ai = createAiClient(this.request.bind(this));
    this.video = { streams: createVideoStreamsClient(this.request.bind(this)) };
  }

  media = {
    convert: <T = unknown>(options: ConvertOptions) => this.convert<T>(options),
    compress: <T = unknown>(options: CompressOptions) => this.compress<T>(options),
    thumbnail: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("thumbnail", options),
    pdfPreview: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("pdf-preview", options),
    imageToPdf: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("image-to-pdf", options),
    stripMetadata: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("strip-metadata", options),
    posterFrame: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("poster-frame", options),
    extractAudio: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("extract-audio", options),
    watermark: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("watermark", options),
    inspect: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("inspect", options),
    trim: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("trim", options),
    gif: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("gif", options),
    storyboard: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("storyboard", options),
    transform: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("transform", options),
    removeBackground: <T = unknown>(options: MediaToolOptions) => this.mediaTool<T>("remove-background", options),
    transfer: <T = ArrayBuffer>(options: TransferOptions) => this.transfer<T>(options),
    signedTransform: <T = { url: string; expiresAt: string }>(options: SignedTransformOptions) =>
      this.request<T>("/api/media/signed-transform", {
        method: "POST",
        body: JSON.stringify(options),
        headers: { "Content-Type": "application/json" },
      }),
  };

  jobs = {
    get: <T = unknown>(jobId: string) => this.request<T>(`/api/jobs/${encodeURIComponent(jobId)}`),
    list: <T = unknown>() => this.request<T>("/api/jobs"),
    cancel: <T = unknown>(jobId: string) =>
      this.request<T>(`/api/jobs/${encodeURIComponent(jobId)}`, { method: "DELETE" }),
    wait: <T extends { status?: string } = { status?: string }>(jobId: string, options: WaitOptions = {}) =>
      this.waitForJob<T>(jobId, options),
  };

  private async convert<T>(options: ConvertOptions) {
    const form = new FormData();
    appendInput(form, options);
    appendPrimitive(form, "format", options.format);
    appendPrimitive(form, "compression", options.compression);
    appendPrimitive(form, "resize", options.resize);
    appendPrimitive(form, "resizeWidth", options.resizeWidth);
    appendPrimitive(form, "resizeHeight", options.resizeHeight);
    appendPrimitive(form, "autoOrient", options.autoOrient);
    appendPrimitive(form, "mono", options.mono);
    appendPrimitive(form, "saveToStorage", options.saveToStorage);
    return this.request<T>("/api/convert", { method: "POST", body: form });
  }

  private async compress<T>(options: CompressOptions) {
    const form = new FormData();
    appendInput(form, options);
    appendPrimitive(form, "mode", options.mode);
    appendPrimitive(form, "quality", options.quality);
    appendPrimitive(form, "targetBytes", options.targetBytes);
    appendPrimitive(form, "lossless", options.lossless);
    appendPrimitive(form, "stripMetadata", options.stripMetadata);
    appendPrimitive(form, "saveToStorage", options.saveToStorage);
    return this.request<T>("/api/compress", { method: "POST", body: form });
  }

  private async transfer<T>(options: TransferOptions) {
    const response = await this.fetcher(`${this.baseUrl}/api/transfer`, {
      method: "POST",
      body: JSON.stringify(options),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      const body = contentType.includes("application/json") ? await response.json() : await response.text();
      const message = typeof body === "object" && body && "error" in body ? String(body.error) : response.statusText;
      throw new ConvertlyError(message, response.status, body);
    }

    if ((options.destination ?? "download") === "download") {
      return (await response.arrayBuffer()) as T;
    }

    return (await response.json()) as T;
  }

  private async mediaTool<T>(tool: string, options: MediaToolOptions) {
    const form = new FormData();
    appendSingleInput(form, options);
    for (const [key, value] of Object.entries(options)) {
      if (["file", "sourceUrl", "filename", "contentType"].includes(key)) continue;
      appendPrimitive(form, key, value);
    }
    return this.request<T>(`/api/media/${tool}`, { method: "POST", body: form });
  }

  private async waitForJob<T extends { status?: string }>(jobId: string, options: WaitOptions) {
    const intervalMs = options.intervalMs ?? 2000;
    const timeoutMs = options.timeoutMs ?? 120000;
    const start = Date.now();

    while (true) {
      const job = await this.jobs.get<T>(jobId);
      if (job.status === "completed" || job.status === "failed") return job;
      if (Date.now() - start > timeoutMs) throw new Error(`Timed out waiting for Convertly job ${jobId}.`);
      await delay(intervalMs, options.signal);
    }
  }

  private async request<T>(path: string, init: RequestInit = {}) {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...(init.headers ?? {}),
      },
    });

    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof body === "object" && body && "error" in body ? String(body.error) : response.statusText;
      throw new ConvertlyError(message, response.status, body);
    }

    return body as T;
  }
}

export function createConvertly(options: ConvertlyClientOptions) {
  return new Convertly(options);
}

export {
  createConvertlyCdn,
  defaultWidths,
  type ConvertlyCdn,
  type ConvertlyCdnConfig,
  type ConvertlyFormat,
  type ConvertlyFit,
  type ConvertlyGravity,
  type ConvertlyPosterTransform,
  type ConvertlyTransform,
  type ConvertlyVideoFormat,
  type ConvertlyVideoTransform,
} from "@convertly-sh/image";

function randomSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `cvly_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

/** @deprecated Prefer `@convertly-sh/player` for HLS playback with controls and branding. */
export class ConvertlyPlayer {
  private readonly video: HTMLVideoElement;
  private readonly playbackId: string;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;
  private readonly analytics: boolean;
  private readonly sessionId = randomSessionId();
  private lastProgressAt = 0;

  constructor(options: ConvertlyPlayerOptions) {
    this.video = options.video;
    this.playbackId = options.playbackId;
    this.baseUrl = (options.baseUrl ?? defaultBaseUrl).replace(/\/$/, "");
    this.fetcher = options.fetch ?? fetch;
    this.analytics = options.analytics !== false;

    if (options.posterUrl) this.video.poster = options.posterUrl;
    if (options.manifestUrl) this.video.src = options.manifestUrl;
    for (const caption of options.captions ?? []) {
      const track = document.createElement("track");
      track.kind = caption.kind ?? "subtitles";
      track.label = caption.label;
      track.srclang = caption.language;
      track.src = caption.url;
      this.video.append(track);
    }
    this.bindAnalytics();
  }

  destroy() {
    this.video.removeAttribute("src");
    this.video.load();
  }

  private bindAnalytics() {
    if (!this.analytics) return;
    const send = (event: "ready" | "play" | "pause" | "ended" | "timeupdate" | "seeked" | "error") => {
      void this.fetcher(`${this.baseUrl}/api/video/playback-events`, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playbackId: this.playbackId,
          sessionId: this.sessionId,
          event,
          currentTime: Number.isFinite(this.video.currentTime) ? this.video.currentTime : undefined,
          duration: Number.isFinite(this.video.duration) ? this.video.duration : undefined,
        }),
      }).catch(() => {});
    };
    this.video.addEventListener("loadedmetadata", () => send("ready"));
    this.video.addEventListener("play", () => send("play"));
    this.video.addEventListener("pause", () => send("pause"));
    this.video.addEventListener("ended", () => send("ended"));
    this.video.addEventListener("seeked", () => send("seeked"));
    this.video.addEventListener("error", () => send("error"));
    this.video.addEventListener("timeupdate", () => {
      const now = Date.now();
      if (now - this.lastProgressAt < 15000) return;
      this.lastProgressAt = now;
      send("timeupdate");
    });
  }
}

export { toBlob };
