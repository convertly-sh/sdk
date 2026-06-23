export function createAiClient(request) {
    return {
        tagFile: async (fileId, options = {}) => {
            return request(`/api/files/${encodeURIComponent(fileId)}/ai-tags`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(options),
            });
        },
    };
}
