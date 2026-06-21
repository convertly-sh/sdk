export function appendPrimitive(form, key, value) {
    if (value === undefined || value === null)
        return;
    if (typeof value === "boolean")
        form.append(key, value ? "true" : "false");
    else if (typeof value === "number")
        form.append(key, String(value));
    else if (typeof value === "string")
        form.append(key, value);
}
export function toBlob(input, contentType) {
    if (input instanceof Blob)
        return input;
    return new Blob([input], { type: contentType });
}
export function appendInput(form, input) {
    if (input.sourceUrl) {
        form.append("sourceUrl", input.sourceUrl);
        return;
    }
    if (!input.file)
        throw new Error("Provide either file or sourceUrl.");
    if (typeof input.file === "string") {
        form.append("sourceUrl", input.file);
        return;
    }
    form.append("files", toBlob(input.file, input.contentType), input.filename ?? "upload");
}
export function appendSingleInput(form, input) {
    if (input.sourceUrl) {
        form.append("sourceUrl", input.sourceUrl);
        return;
    }
    if (!input.file)
        throw new Error("Provide either file or sourceUrl.");
    if (typeof input.file === "string") {
        form.append("sourceUrl", input.file);
        return;
    }
    form.append("file", toBlob(input.file, input.contentType), input.filename ?? "upload");
}
export function buildQuery(params) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null)
            continue;
        query.set(key, String(value));
    }
    return query.size ? `?${query}` : "";
}
