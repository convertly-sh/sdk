import { ConvertlyError } from "./errors.js";
import { buildQuery, toBlob } from "./internal/form.js";
import type {
  CompleteUploadBody,
  CreateFolderOptions,
  CreateUploadSessionOptions,
  ListFilesOptions,
  ListFoldersOptions,
  RequestFn,
  StoredFileRecord,
  StoredFolderRecord,
  UpdateFileOptions,
  UpdateFolderOptions,
  UploadFileOptions,
  UploadSession,
} from "./types.js";

const DEFAULT_PRESIGNED_THRESHOLD_BYTES = 8 * 1024 * 1024;

function resolveUploadBlob(input: UploadFileOptions) {
  const contentType = input.contentType ?? "application/octet-stream";
  const blob = toBlob(input.file, contentType);
  if (blob.size <= 0) throw new Error("Upload file is empty.");
  return { blob, contentType, sizeBytes: blob.size };
}

async function putPresignedObject(
  fetcher: typeof fetch,
  session: UploadSession,
  blob: Blob,
  contentType: string,
) {
  const response = await fetcher(session.upload.signedUrl, {
    method: session.upload.method || "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ConvertlyError(
      `Presigned upload failed with status ${response.status}.`,
      response.status,
      body,
    );
  }
}

export function createStorageClient(request: RequestFn, fetcher: typeof fetch) {
  return {
    files: {
      list: async (options: ListFilesOptions = {}) => {
        const query = buildQuery({
          folderId: options.folderId === null ? "null" : options.folderId,
          limit: options.limit,
          offset: options.offset,
          q: options.search,
          mimePrefix: options.mimePrefix,
          wordpressInstance: options.wordpressInstance,
          excludeWordpress: options.excludeWordpress ? "1" : undefined,
        });
        return request<{ files: StoredFileRecord[]; pagination: { limit: number; offset: number; total: number; hasMore: boolean } }>(
          `/api/files${query}`,
        );
      },

      get: async (fileId: string) => {
        return request<{ file: StoredFileRecord & { download_url: string; expiresIn: number } }>(
          `/api/files/${encodeURIComponent(fileId)}`,
          { headers: { Accept: "application/json" } },
        );
      },

      upload: async (options: UploadFileOptions) => {
        const { blob, contentType, sizeBytes } = resolveUploadBlob(options);
        const threshold = options.presignedThresholdBytes ?? DEFAULT_PRESIGNED_THRESHOLD_BYTES;
        const strategy =
          options.strategy ?? (sizeBytes >= threshold ? "presigned" : "multipart");

        if (strategy === "multipart") {
          const form = new FormData();
          form.append("file", blob, options.filename);
          if (options.folderId) form.append("folderId", options.folderId);
          return request<{ file: StoredFileRecord }>("/api/files", { method: "POST", body: form });
        }

        const session = await request<UploadSession>("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: options.filename,
            contentType,
            sizeBytes,
            folderId: options.folderId ?? null,
            resumable: options.resumable ?? true,
          }),
        });

        await putPresignedObject(fetcher, session, blob, contentType);

        return request<{ file: StoredFileRecord; idempotent?: boolean }>("/api/uploads/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session.complete.body),
        });
      },

      update: async (fileId: string, options: UpdateFileOptions) => {
        return request<{ file: StoredFileRecord }>(`/api/files/${encodeURIComponent(fileId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: options.filename,
            cdnSlug: options.cdnSlug,
            description: options.description,
            tags: options.tags,
          }),
        });
      },

      delete: async (fileId: string) => {
        return request<{ success: boolean; message: string }>(`/api/files/${encodeURIComponent(fileId)}`, {
          method: "DELETE",
        });
      },
    },

    folders: {
      list: async (options: ListFoldersOptions = {}) => {
        const query = buildQuery({
          parentId: options.parentId === null ? "null" : options.parentId,
          q: options.search,
          wordpressInstance: options.wordpressInstance,
          excludeWordpress: options.excludeWordpress ? "1" : undefined,
        });
        return request<{ folders: StoredFolderRecord[] }>(`/api/folders${query}`);
      },

      create: async (options: CreateFolderOptions) => {
        return request<{ folder: StoredFolderRecord }>("/api/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: options.name,
            color: options.color,
            parentId: options.parentId ?? null,
            wordpressInstanceId: options.wordpressInstanceId,
          }),
        });
      },

      update: async (folderId: string, options: UpdateFolderOptions) => {
        return request<{ folder: StoredFolderRecord }>(`/api/folders/${encodeURIComponent(folderId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: options.name,
            parentId: options.parentId,
          }),
        });
      },

      delete: async (folderId: string) => {
        return request<{ success: boolean; message: string }>(`/api/folders/${encodeURIComponent(folderId)}`, {
          method: "DELETE",
        });
      },
    },

    uploads: {
      createSession: async (options: CreateUploadSessionOptions) => {
        return request<UploadSession>("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: options.filename,
            contentType: options.contentType ?? "application/octet-stream",
            sizeBytes: options.sizeBytes,
            folderId: options.folderId ?? null,
            resumable: options.resumable ?? true,
          }),
        });
      },

      putObject: async (session: UploadSession, file: Blob | ArrayBuffer | Uint8Array | Buffer, contentType?: string) => {
        const blob = file instanceof Blob ? file : toBlob(file, contentType ?? "application/octet-stream");
        await putPresignedObject(fetcher, session, blob, contentType ?? blob.type ?? "application/octet-stream");
      },

      complete: async (body: CompleteUploadBody) => {
        return request<{ file: StoredFileRecord; idempotent?: boolean }>("/api/uploads/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      },
    },
  };
}

export type ConvertlyStorageClient = ReturnType<typeof createStorageClient>;
