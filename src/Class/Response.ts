export class Response<TBody>
{
    public statusCode: number;
    public headers?: { [key: string]: string };
    public body?: TBody;

    constructor(statusCode: number, headers?: { [p: string]: string }, body?: TBody)
    {
        this.statusCode = statusCode;
        this.headers = headers;
        this.body = body;
    }
}