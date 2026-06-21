export class ConvertlyError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ConvertlyError";
    this.status = status;
    this.body = body;
  }
}
