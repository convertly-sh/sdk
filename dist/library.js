import { buildQuery } from "./internal/form.js";
export function createLibraryClient(request) {
    return {
        taxonomy: {
            list: async (options = {}) => {
                const query = buildQuery({ locale: options.locale });
                return request(`/api/library/taxonomy/terms${query}`);
            },
            create: async (options) => {
                return request("/api/library/taxonomy/terms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(options),
                });
            },
            update: async (termId, options) => {
                return request(`/api/library/taxonomy/terms/${encodeURIComponent(termId)}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(options),
                });
            },
            delete: async (termId) => {
                return request(`/api/library/taxonomy/terms/${encodeURIComponent(termId)}`, {
                    method: "DELETE",
                });
            },
        },
    };
}
