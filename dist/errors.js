export class ConvertlyError extends Error {
    constructor(message, status, body) {
        super(message);
        this.name = "ConvertlyError";
        this.status = status;
        this.body = body;
    }
}
