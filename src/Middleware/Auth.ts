import Koa from 'koa';

function needAuth(ctx: Koa.ParameterizedContext)
{
    ctx.response.status = 401;
    ctx.response.set({
        'WWW-Authenticate': 'Basic realm=soulike-git',
    });
}

export const auth = (): Koa.Middleware =>
{
    return async (ctx, next) =>
    {
        const {authorization} = ctx.request.header;
        if (typeof authorization !== 'string')
        {
            needAuth(ctx);
        }
        else
        {
            const parts = authorization.split(' ');
            if (parts.length !== 2 || parts[0].toLowerCase() !== 'basic')
            {
                needAuth(ctx);
            }
            else
            {
                const decode = Buffer.from(parts[1], 'base64').toString('utf-8');
                const auth = decode.split(':');
                if (auth.length !== 2)
                {
                    needAuth(ctx);
                }
                else
                {
                    // 可以对用户名和密码通过其它方式进一步认证
                    const [username, password] = auth;
                    if (username === 'soulike' && password === '123456')
                    {
                        await next();
                    }
                    else
                    {
                        needAuth(ctx);
                    }
                }
            }
        }
    };
};