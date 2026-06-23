import { buildQuery } from "./internal/form.js";
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

export function createLibraryClient(request: RequestFn) {
  return {
    taxonomy: {
      list: async (options: { locale?: string } = {}) => {
        const query = buildQuery({ locale: options.locale });
        return request<{ terms: LibraryTaxonomyTerm[]; locale: string }>(`/api/library/taxonomy/terms${query}`);
      },

      create: async (options: CreateTaxonomyTermOptions) => {
        return request<{ term: LibraryTaxonomyTerm }>("/api/library/taxonomy/terms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options),
        });
      },

      update: async (termId: string, options: UpdateTaxonomyTermOptions) => {
        return request<{ term: LibraryTaxonomyTerm }>(`/api/library/taxonomy/terms/${encodeURIComponent(termId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options),
        });
      },

      delete: async (termId: string) => {
        return request<{ success: boolean }>(`/api/library/taxonomy/terms/${encodeURIComponent(termId)}`, {
          method: "DELETE",
        });
      },
    },
  };
}

export type ConvertlyLibraryClient = ReturnType<typeof createLibraryClient>;
