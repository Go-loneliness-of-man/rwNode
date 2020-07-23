
const lib = require('./lib.ts');
const ctx = require('./ctx.ts');
const router = require('./router.ts');
const config = require('../config/config.ts');
const pubC = require('./pubC.ts');
import http = require('http');

class application {

  public path: any; // 常用路径
  public lib: any; // 工具对象
  public router: any; // 路由对象
  public ctx: any; // 上下文对象
  public config: any; // 框架配置对象
  public server: any; // http 服务
  public pubC: any; // 公共控制器

  constructor() {
    this.config = config; // 配置文件
    this.path = this.definePath(); // 定义路径
    this.lib = new lib(); // 框架工具函数
    this.ctx = new ctx(this); // 加载上下文
    this.router = new router(this); // 加载路由配置
    this.pubC = new pubC(this); // 加载公共控制器
  }

  private definePath(): object {
    const root: string = __dirname.split('core')[0]; // 根目录
    const controller: string = `${root}app\\controller\\`; // 控制器目录
    const service: string = `${root}app\\service\\`; // 服务目录
    const model: string = `${root}app\\model\\`; // 模型目录
    const lib: string = `${root}app\\lib\\`; // 用户工具函数目录
    const router: string = `${root}app\\router\\`; // 路由目录
    const middleware: string = `${root}app\\middleware\\`; // 中间件目录
    const plugin: string = `${root}plugin\\`; // 插件目录
    const config: string = `${root}config\\`; // 配置文件目录
    return { controller, lib, model, router, middleware, service, plugin, config };
  }

  // 调试日志，在配置文件开启 outInfo、outAllInfo 后才有效，all 为 true 代表输出 outAllInfo 对应的信息，false 代表输出 outInfo 对应的信息，若要打印多个参数 message 应为数组
  public log(message: any, all: boolean = false): void {
    if (!all && this.config.outInfo) typeof message === 'string' ? this.lib.out(true, message) : this.lib.out(true, ... message);
    if (all && this.config.outAllInfo) typeof message === 'string' ? this.lib.out(true, message) : this.lib.out(true, ... message);
  }

  // 收到请求时执行的回调
  public async responseCallback(req: any, res: any) {
    this.log(`\n----------------- 收到 ${req.method} 请求：${req.url}`);
    this.ctx.params = await this.lib.parseBody(req); // 解析并返回请求 body
    this.log(['请求 body：', this.ctx.params]);
    Object.assign(this.ctx, { req, res }); // 将 req、res 附加到 ctx
    await this.ctx.execMiddleware(this, this.ctx.req, this.ctx.res); // 执行中间件
    const callback = this.router.parse(this.ctx.req); // 解析路由获取控制器
    this.log(['所有参数：', this.ctx.params, '\n-----------------------------------------------------------------------------------------------------------------------\n']);
    this.ctx.response = await callback.call(this.pubC); // 分发控制器
    res.writeHead(200, this.config.header); // 设置响应 header
    res.end(JSON.stringify(this.ctx.response)); // 设置返回结果
  }
}

const app = new application(); // 启动项目
app.log('启动 http 服务 ...');
app.server = http.createServer(app.responseCallback.bind(app)); // 启动 http 服务
app.server.listen(app.config.port); // 监听 port 等待请求
console.log(`rwNode 已经运行在：http://localhost:${app.config.port}`);

module.exports = app;

