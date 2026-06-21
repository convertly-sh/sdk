import { toBlob } from "./internal/form.js";
export function createVideoStreamsClient(request) {
    const streamPath = (id) => `/api/video/streams/${encodeURIComponent(id)}`;
    return {
        create: (options) => request("/api/video/streams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options),
        }),
        list: (params = {}) => {
            const query = new URLSearchParams();
            if (params.limit)
                query.set("limit", String(params.limit));
            if (params.offset)
                query.set("offset", String(params.offset));
            if (params.status)
                query.set("status", params.status);
            return request(`/api/video/streams${query.size ? `?${query}` : ""}`);
        },
        get: (id) => request(streamPath(id)),
        update: (id, options) => request(streamPath(id), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options),
        }),
        delete: (id) => request(streamPath(id), { method: "DELETE" }),
        addCaptions: (id, track) => request(`${streamPath(id)}/captions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(track),
        }),
        removeCaption: (id, captionId) => request(`${streamPath(id)}/captions?captionId=${encodeURIComponent(captionId)}`, {
            method: "DELETE",
        }),
        replaceChapters: (id, chapters) => request(`${streamPath(id)}/chapters`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chapters }),
        }),
        removeChapter: (id, chapterId) => request(`${streamPath(id)}/chapters?chapterId=${encodeURIComponent(chapterId)}`, {
            method: "DELETE",
        }),
        setPosterFromTime: (id, timeSeconds) => request(`${streamPath(id)}/poster`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timeSeconds }),
        }),
        uploadPoster: (id, file, filename = "poster.jpg", contentType = "image/jpeg") => {
            const form = new FormData();
            form.append("poster", toBlob(file, contentType), filename);
            return request(`${streamPath(id)}/poster`, { method: "POST", body: form });
        },
        listThumbnailCandidates: (id) => request(`${streamPath(id)}/thumbnails`),
    };
}
