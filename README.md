# @convertly-sh/sdk

Official JavaScript/TypeScript client for the <a href="https://docs.convertly.sh/docs/sdk" target="_blank" rel="noopener noreferrer">Convertly media API</a> — convert, compress, trim, watermark, vectorize, and run async jobs against Convertly's REST endpoints.

```bash
npm install @convertly-sh/sdk
```

For **image CDN URL building** (responsive `srcset`, Next.js loader, React components), use <a href="https://www.npmjs.com/package/@convertly-sh/image" target="_blank" rel="noopener noreferrer">`@convertly-sh/image`</a> instead. This package is for server-side and client-side **API** calls.

## Source on npm

Published files (`dist/`, `README.md`, `LICENSE`) are visible on npm under **Package → Code**. The main app repo is private; this SDK is MIT-licensed for reuse.

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

## CDN helpers (re-exported)

```ts
import { createConvertlyCdn } from "@convertly-sh/sdk";

const cdn = createConvertlyCdn({
  namespace: process.env.NEXT_PUBLIC_CONVERTLY_CDN_NAMESPACE!,
});

cdn.origin("site", "hero.jpg", { w: 1200 }); // requires origin source in dashboard
```

See the <a href="https://www.npmjs.com/package/@convertly-sh/image" target="_blank" rel="noopener noreferrer">`@convertly-sh/image` README</a> for origin vs storage prerequisites.

## Security

- **`CONVERTLY_API_KEY`** (`cvly_…`) — full workspace access. Never expose in the browser or `NEXT_PUBLIC_*`.
- **`NEXT_PUBLIC_CONVERTLY_CDN_NAMESPACE`** — public CDN namespace. Safe in client code.

## Docs

- <a href="https://docs.convertly.sh/docs/sdk" target="_blank" rel="noopener noreferrer">JavaScript SDK</a>
- <a href="https://docs.convertly.sh/docs/image-cdn" target="_blank" rel="noopener noreferrer">Image CDN</a>
- <a href="https://docs.convertly.sh/docs/media-tools" target="_blank" rel="noopener noreferrer">Media tools API</a>

## License

**MIT** © <a href="https://convertly.sh" target="_blank" rel="noopener noreferrer">Convertly</a>.

- Full text: <a href="https://www.npmjs.com/package/@convertly-sh/sdk?activeTab=code" target="_blank" rel="noopener noreferrer">npm → Code → `LICENSE`</a>
- Summary: <a href="https://opensource.org/license/mit" target="_blank" rel="noopener noreferrer">MIT on Open Source Initiative</a>
