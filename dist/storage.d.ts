import type { CompleteUploadBody, CreateFolderOptions, CreateUploadSessionOptions, ListFilesOptions, ListFoldersOptions, RequestFn, StoredFileRecord, StoredFolderRecord, UpdateFileOptions, UpdateFolderOptions, UploadFileOptions, UploadSession } from "./types.js";
export declare function createStorageClient(request: RequestFn, fetcher: typeof fetch): {
    files: {
        list: (options?: ListFilesOptions) => Promise<{
            files: StoredFileRecord[];
            pagination: {
                limit: number;
                offset: number;
                total: number;
                hasMore: boolean;
            };
        }>;
        get: (fileId: string) => Promise<{
            file: StoredFileRecord & {
                download_url: string;
                expiresIn: number;
            };
        }>;
        upload: (options: UploadFileOptions) => Promise<{
            file: StoredFileRecord;
        }>;
        update: (fileId: string, options: UpdateFileOptions) => Promise<{
            file: StoredFileRecord;
        }>;
        delete: (fileId: string) => Promise<{
            success: boolean;
            message: string;
        }>;
    };
    folders: {
        list: (options?: ListFoldersOptions) => Promise<{
            folders: StoredFolderRecord[];
        }>;
        create: (options: CreateFolderOptions) => Promise<{
            folder: StoredFolderRecord;
        }>;
        update: (folderId: string, options: UpdateFolderOptions) => Promise<{
            folder: StoredFolderRecord;
        }>;
        delete: (folderId: string) => Promise<{
            success: boolean;
            message: string;
        }>;
    };
    uploads: {
        createSession: (options: CreateUploadSessionOptions) => Promise<UploadSession>;
        putObject: (session: UploadSession, file: Blob | ArrayBuffer | Uint8Array | Buffer, contentType?: string) => Promise<void>;
        complete: (body: CompleteUploadBody) => Promise<{
            file: StoredFileRecord;
            idempotent?: boolean;
        }>;
    };
};
export type ConvertlyStorageClient = ReturnType<typeof createStorageClient>;
