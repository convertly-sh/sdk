const defaultBaseUrl = "https://convertly.sh";
function appendPrimitive(form, key, value) {
    if (value === undefined || value === null)
        return;
    if (typeof value === "boolean")
        form.append(key, value ? "true" : "false");
    else if (typeof value === "number")
        form.append(key, String(value));
    else if (typeof value === "string")
        form.append(key, value);
}
function toBlob(input, contentType) {
    if (input instanceof Blob)
        return input;
    return new Blob([input], { type: contentType });
}
function appendInput(form, input) {
    if (input.sourceUrl) {
        form.append("sourceUrl", input.sourceUrl);
        return;
    }
    if (!input.file)
        throw new Error("Provide either file or sourceUrl.");
    if (typeof input.file === "string") {
        form.append("sourceUrl", input.file);
        return;
    }
    form.append("files", toBlob(input.file, input.contentType), input.filename ?? "upload");
}
function appendSingleInput(form, input) {
    if (input.sourceUrl) {
        form.append("sourceUrl", input.sourceUrl);
        return;
    }
    if (!input.file)
        throw new Error("Provide either file or sourceUrl.");
    if (typeof input.file === "string") {
        form.append("sourceUrl", input.file);
        return;
    }
    form.append("file", toBlob(input.file, input.contentType), input.filename ?? "upload");
}
function delay(ms, signal) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(signal.reason ?? new Error("Aborted."));
        }, { once: true });
    });
}
export class ConvertlyError extends Error {
    constructor(message, status, body) {
        super(message);
        this.name = "ConvertlyError";
        this.status = status;
        this.body = body;
    }
}
export class Convertly {
    constructor(options) {
        this.media = {
            convert: (options) => this.convert(options),
            compress: (options) => this.compress(options),
            thumbnail: (options) => this.mediaTool("thumbnail", options),
            pdfPreview: (options) => this.mediaTool("pdf-preview", options),
            imageToPdf: (options) => this.mediaTool("image-to-pdf", options),
            stripMetadata: (options) => this.mediaTool("strip-metadata", options),
            posterFrame: (options) => this.mediaTool("poster-frame", options),
            extractAudio: (options) => this.mediaTool("extract-audio", options),
            watermark: (options) => this.mediaTool("watermark", options),
            inspect: (options) => this.mediaTool("inspect", options),
            trim: (options) => this.mediaTool("trim", options),
            gif: (options) => this.mediaTool("gif", options),
            storyboard: (options) => this.mediaTool("storyboard", options),
            transform: (options) => this.mediaTool("transform", options),
            transfer: (options) => this.transfer(options),
            signedTransform: (options) => this.request("/api/media/signed-transform", {
                method: "POST",
                body: JSON.stringify(options),
                headers: { "Content-Type": "application/json" },
            }),
        };
        this.jobs = {
            get: (jobId) => this.request(`/api/jobs/${encodeURIComponent(jobId)}`),
            list: () => this.request("/api/jobs"),
            cancel: (jobId) => this.request(`/api/jobs/${encodeURIComponent(jobId)}`, { method: "DELETE" }),
            wait: (jobId, options = {}) => this.waitForJob(jobId, options),
        };
        if (!options.apiKey)
            throw new Error("Convertly API key is required.");
        this.apiKey = options.apiKey;
        this.baseUrl = (options.baseUrl ?? defaultBaseUrl).replace(/\/$/, "");
        this.fetcher = options.fetch ?? fetch;
    }
    async convert(options) {
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
        return this.request("/api/convert", { method: "POST", body: form });
    }
    async compress(options) {
        const form = new FormData();
        appendInput(form, options);
        appendPrimitive(form, "mode", options.mode);
        appendPrimitive(form, "quality", options.quality);
        appendPrimitive(form, "targetBytes", options.targetBytes);
        appendPrimitive(form, "lossless", options.lossless);
        appendPrimitive(form, "stripMetadata", options.stripMetadata);
        appendPrimitive(form, "saveToStorage", options.saveToStorage);
        return this.request("/api/compress", { method: "POST", body: form });
    }
    async transfer(options) {
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
            return (await response.arrayBuffer());
        }
        return (await response.json());
    }
    async mediaTool(tool, options) {
        const form = new FormData();
        appendSingleInput(form, options);
        for (const [key, value] of Object.entries(options)) {
            if (["file", "sourceUrl", "filename", "contentType"].includes(key))
                continue;
            appendPrimitive(form, key, value);
        }
        return this.request(`/api/media/${tool}`, { method: "POST", body: form });
    }
    async waitForJob(jobId, options) {
        const intervalMs = options.intervalMs ?? 2000;
        const timeoutMs = options.timeoutMs ?? 120000;
        const start = Date.now();
        while (true) {
            const job = await this.jobs.get(jobId);
            if (job.status === "completed" || job.status === "failed")
                return job;
            if (Date.now() - start > timeoutMs)
                throw new Error(`Timed out waiting for Convertly job ${jobId}.`);
            await delay(intervalMs, options.signal);
        }
    }
    async request(path, init = {}) {
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
        return body;
    }
}
export function createConvertly(options) {
    return new Convertly(options);
}
