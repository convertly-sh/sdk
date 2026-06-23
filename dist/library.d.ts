import type { RequestFn } from "./types.js";
export type LibraryTaxonomyTerm = {
    id: string;
    slug: string;
    label: string;
    locale: string;
    groupName: string | null;
    synonyms: string[];
    createdAt?: string;
    updatedAt?: string;
};
export type CreateTaxonomyTermOptions = {
    slug: string;
    label: string;
    locale?: string;
    groupName?: string | null;
    synonyms?: string[];
};
export type UpdateTaxonomyTermOptions = Partial<CreateTaxonomyTermOptions>;
export declare function createLibraryClient(request: RequestFn): {
    taxonomy: {
        list: (options?: {
            locale?: string;
        }) => Promise<{
            terms: LibraryTaxonomyTerm[];
            locale: string;
        }>;
        create: (options: CreateTaxonomyTermOptions) => Promise<{
            term: LibraryTaxonomyTerm;
        }>;
        update: (termId: string, options: UpdateTaxonomyTermOptions) => Promise<{
            term: LibraryTaxonomyTerm;
        }>;
        delete: (termId: string) => Promise<{
            success: boolean;
        }>;
    };
};
export type ConvertlyLibraryClient = ReturnType<typeof createLibraryClient>;
