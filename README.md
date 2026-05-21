# Convertly JavaScript SDK

```ts
import { Convertly } from "@convertly-sh/sdk";

const convertly = new Convertly({ apiKey: process.env.CONVERTLY_API_KEY! });

const job = await convertly.media.trim({
  sourceUrl: "https://cdn.example.com/video.mp4",
  start: 10,
  duration: 8,
  async: true,
});

const result = await convertly.jobs.wait(job.jobId);
```

The SDK supports multipart uploads, `sourceUrl` for media tools and transfers, async jobs, and media tool endpoints.
Raster-to-SVG conversion preserves color by default; pass `mono: true` to `media.convert` only for monochrome tracing.
