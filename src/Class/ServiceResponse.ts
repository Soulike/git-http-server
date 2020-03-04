/**
 * @class
 * @description 服务层处理业务完成后向分发层返回的对象
 * */
export class ServiceResponse<TBody>
{
    public readonly statusCode: number;
    public readonly headers: Readonly<{ [key: string]: string }>;
    public readonly body?: TBody;

    constructor(statusCode: number, headers: { [key: string]: string }, body?: TBody)
    {
        this.statusCode = statusCode;
        this.headers = Object.freeze(headers);
        this.body = body;
    }
}