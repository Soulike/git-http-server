import Koa from 'koa';
import dispatcher from './Dispatcher';
import {SERVER} from './CONFIG';

const app = new Koa();

app.on('error', (e: Error) =>
{
    console.error(`未捕获的错误：\n${e.stack}`);
});
app.use(dispatcher());
app.listen(SERVER.PORT, () =>
{
    console.info(`服务器运行在端口 ${SERVER.PORT} (PID: ${process.pid})`);
});