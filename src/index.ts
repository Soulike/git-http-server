import Koa from 'koa';
import {dispatcher} from './Dispatcher';
import {SERVER} from './CONFIG';

const app = new Koa();

app.on('error', (e: Error) =>
{
    SERVER.ERROR_LOGGER(`服务器未捕获的错误:\n${e.stack}`);
});
app.use(dispatcher(app));
app.listen(SERVER.PORT, () =>
{
    SERVER.INFO_LOGGER(`服务器运行在端口 ${SERVER.PORT} (PID: ${process.pid})`);
});