//import {SERVER} from './SERVER';
import {ioredis} from '../Singleton';
import session, {opts, Session} from 'koa-session';

export const SESSION: Partial<session.opts> = {
    key: 'sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    signed: false,
    /** (boolean) signed or not (default true) */
    store: {
        get: async (key: string) =>
        {
            const value = await ioredis.get(key);
            if (value)
            {
                return JSON.parse(value);
            }
            else
            {
                return value;
            }

        },
        set: async (key: string, sess: Partial<Session> & { _expire?: number, _maxAge?: number }, maxAge: opts['maxAge']) =>
        {
            return await ioredis.set(key, JSON.stringify(sess), 'PX', maxAge);
        },
        destroy: async (key: string) =>
        {
            return await ioredis.del(key);
        },
    },
};