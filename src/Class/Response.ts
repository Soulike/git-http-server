export class Response<TBody>
{
    public isSuccessful: boolean;   // 本次请求是否成功
    public message?: string;         // 请求失败时，显示给用户的消息
    public data?: TBody;               // 请求成功时，前端需要的数据

    constructor(isSuccessful: boolean, message?: string, data?: TBody)
    {
        this.isSuccessful = isSuccessful;
        this.message = message;
        this.data = data;
    }
}