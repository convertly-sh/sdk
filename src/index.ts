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
  renditions?: Array<{ height: number; bitrate: number; audioBitrate?: number }>;
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
  captions?: Array<{ url: string; label: string; language: string; kind?: "subtitles" | "captions" }>;
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

const defaultBaseUrl = "https://convertly.sh";

function appendPrimitive(form: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return;
  if (typeof value === "boolean") form.append(key, value ? "true" : "false");
  else if (typeof value === "number") form.append(key, String(value));
  else if (typeof value === "string") form.append(key, value);
}

function toBlob(input: Exclude<ConvertlyInput, string>, contentType?: string) {
  if (input instanceof Blob) return input;
  return new Blob([input as BlobPart], { type: contentType });
}

function appendInput(form: FormData, input: ConvertlyFileInput) {
  if (input.sourceUrl) {
    form.append("sourceUrl", input.sourceUrl);
    return;
  }
  if (!input.file) throw new Error("Provide either file or sourceUrl.");
  if (typeof input.file === "string") {
    form.append("sourceUrl", input.file);
    return;
  }
  form.append("files", toBlob(input.file, input.contentType), input.filename ?? "upload");
}

function appendSingleInput(form: FormData, input: ConvertlyFileInput) {
  if (input.sourceUrl) {
    form.append("sourceUrl", input.sourceUrl);
    return;
  }
  if (!input.file) throw new Error("Provide either file or sourceUrl.");
  if (typeof input.file === "string") {
    form.append("sourceUrl", input.file);
    return;
  }
  form.append("file", toBlob(input.file, input.contentType), input.filename ?? "upload");
}

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

export class ConvertlyError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ConvertlyError";
    this.status = status;
    this.body = body;
  }
}

export class Convertly {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: ConvertlyClientOptions) {
    if (!options.apiKey) throw new Error("Convertly API key is required.");
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? defaultBaseUrl).replace(/\/$/, "");
    this.fetcher = options.fetch ?? fetch;
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

  video = {
    streams: {
      create: <T = unknown>(options: VideoStreamOptions) =>
        this.request<T>("/api/video/streams", {
          method: "POST",
          body: JSON.stringify(options),
          headers: { "Content-Type": "application/json" },
        }),
      list: <T = unknown>(params: { limit?: number; offset?: number; status?: string } = {}) => {
        const query = new URLSearchParams();
        if (params.limit) query.set("limit", String(params.limit));
        if (params.offset) query.set("offset", String(params.offset));
        if (params.status) query.set("status", params.status);
        return this.request<T>(`/api/video/streams${query.size ? `?${query}` : ""}`);
      },
      get: <T = unknown>(id: string) => this.request<T>(`/api/video/streams/${encodeURIComponent(id)}`),
      delete: <T = unknown>(id: string) =>
        this.request<T>(`/api/video/streams/${encodeURIComponent(id)}`, { method: "DELETE" }),
    },
  };

  live = {
    inputs: {
      create: <T = unknown>(options: LiveInputOptions = {}) =>
        this.request<T>("/api/live/inputs", {
          method: "POST",
          body: JSON.stringify(options),
          headers: { "Content-Type": "application/json" },
        }),
      list: <T = unknown>() => this.request<T>("/api/live/inputs"),
      get: <T = unknown>(id: string) => this.request<T>(`/api/live/inputs/${encodeURIComponent(id)}`),
      update: <T = unknown>(id: string, options: LiveInputUpdateOptions) =>
        this.request<T>(`/api/live/inputs/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify(options),
          headers: { "Content-Type": "application/json" },
        }),
      rotateKey: <T = unknown>(id: string) =>
        this.request<T>(`/api/live/inputs/${encodeURIComponent(id)}/rotate-key`, { method: "POST" }),
      delete: <T = unknown>(id: string) =>
        this.request<T>(`/api/live/inputs/${encodeURIComponent(id)}`, { method: "DELETE" }),
    },
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

function randomSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `cvly_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

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
