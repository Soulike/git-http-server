import {Middleware} from 'koa';

export default (): Middleware =>
{
    return async (ctx, next) =>
    {
        try
        {
            await next();
        }
        catch (e)
        {
            ctx.response.status = 500;
            console.error(e);
        }
    };
}