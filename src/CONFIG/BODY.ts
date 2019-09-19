import body from 'koa-body';
import {Response} from '../Class';
import {SERVER} from './SERVER';

export const BODY: body.IKoaBodyOptions = {
    multipart: true,
    onError: (err, ctx) =>
    {
        SERVER.ERROR_LOGGER(err);
        ctx.response.body = new Response(400);
    },
};