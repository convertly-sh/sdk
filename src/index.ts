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

export type TransferOptions = {
  sourceUrl: string;
  destination?: "download" | "convertly-storage";
  filename?: string;
  contentType?: string;
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
