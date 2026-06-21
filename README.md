# @convertly-sh/sdk

Official JavaScript/TypeScript client for the <a href="https://docs.convertly.sh/docs/sdk" target="_blank" rel="noopener noreferrer">Convertly media API</a> — convert, compress, trim, watermark, storage uploads, video streams, async jobs, and transfers.

```bash
npm install @convertly-sh/sdk
```

For **image CDN URL building** (responsive `srcset`, Next.js loader, React components), use <a href="https://www.npmjs.com/package/@convertly-sh/image" target="_blank" rel="noopener noreferrer">`@convertly-sh/image`</a> instead. This package is for server-side and client-side **API** calls.

## Quick start

```ts
import { Convertly } from "@convertly-sh/sdk";

const convertly = new Convertly({
  apiKey: process.env.CONVERTLY_API_KEY!, // cvly_… — server-side only
});

await convertly.media.convert({
  file: await fetch("https://example.com/photo.png").then((r) => r.blob()),
  filename: "photo.png",
  format: "webp",
  saveToStorage: true,
});
```

## Convertly Storage

```ts
const { file } = await convertly.storage.files.upload({
  file: buffer,
  filename: "hero.jpg",
  contentType: "image/jpeg",
});

const { files } = await convertly.storage.files.list({ folderId: null, limit: 50 });
```

Files over 8 MiB use presigned direct-to-storage uploads automatically. Override with `strategy: "multipart" | "presigned" | "auto"`.

## Video streams

```ts
const { stream } = await convertly.video.streams.create({
  sourceFileId: file.id,
  packageFormats: ["hls"],
});

await convertly.video.streams.addCaptions(stream.id, {
  label: "English",
  language: "en",
  content: "WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nHello",
});
```

Playback UI: <a href="https://www.npmjs.com/package/@convertly-sh/player" target="_blank" rel="noopener noreferrer">`@convertly-sh/player`</a>.

## CDN helpers (re-exported)

```ts
import { createConvertlyCdn } from "@convertly-sh/sdk";

const cdn = createConvertlyCdn({
  namespace: process.env.NEXT_PUBLIC_CONVERTLY_CDN_NAMESPACE!,
});

cdn.origin("site", "hero.jpg", { w: 1200 });
```

## Other languages

First-party SDKs: JavaScript/TypeScript (`@convertly-sh/sdk`) and PHP (`convertly/convertly-php`). For Python, Go, and others, use the <a href="https://docs.convertly.sh/openapi.json" target="_blank" rel="noopener noreferrer">OpenAPI spec</a> with REST or codegen.

## Security

- **`CONVERTLY_API_KEY`** (`cvly_…`) — full workspace access. Never expose in the browser or `NEXT_PUBLIC_*`.
- **`NEXT_PUBLIC_CONVERTLY_CDN_NAMESPACE`** — public CDN namespace. Safe in client code.

## Docs

- <a href="https://docs.convertly.sh/docs/sdk" target="_blank" rel="noopener noreferrer">JavaScript SDK</a>
- <a href="https://docs.convertly.sh/docs/image-cdn" target="_blank" rel="noopener noreferrer">Image CDN</a>
- <a href="https://docs.convertly.sh/docs/media-tools" target="_blank" rel="noopener noreferrer">Media tools API</a>

## License

**MIT** © <a href="https://convertly.sh" target="_blank" rel="noopener noreferrer">Convertly</a>.
