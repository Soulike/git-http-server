import body from 'koa-body';
import signale from 'signale';
import {Response} from '../Class';

export const BODY: body.IKoaBodyOptions = {
    multipart: true,
    onError: (err, ctx) =>
    {
        signale.error(err);
        ctx.response.body = new Response(false, '请求参数错误');
    },
};