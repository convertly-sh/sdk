import type { RequestFn } from "./types.js";

export type AiTagFileOptions = {
  maxTags?: number;
  merge?: boolean;
  locale?: string;
  prompt?: string;
};

export type AiTagFileResult = {
  file: { id: string; metadata: Record<string, unknown> | null };
  tags: string[];
  addedTags: string[];
  addedCount: number;
  summary: string;
  embeddedInFile: boolean;
  usage: { units: number; operation: "image.tags" };
};

export function createAiClient(request: RequestFn) {
  return {
    tagFile: async (fileId: string, options: AiTagFileOptions = {}) => {
      return request<AiTagFileResult>(`/api/files/${encodeURIComponent(fileId)}/ai-tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });
    },
  };
}

export type ConvertlyAiClient = ReturnType<typeof createAiClient>;
