
module.exports = class ctx {

  private middleware: Function[]; // 中间件
  public controller: any; // 控制器
  public service: any; // 服务
  public model: any; // 模型
  public lib: any; // 用户工具类
  public plugin: any; // 插件类
  public params: object; // 参数对象
  public req: any; // 请求对象
  public res: any; // 响应对象
  private app: any; // 中间件

  constructor(app) {
    this.app = app;
    const dirs = [{ name: 'middleware', type: 'array' }, 'controller', 'service', 'model', 'lib', 'plugin'];
    dirs.forEach(dir => this.load(dir)); // 加载中间件、控制器、服务、模型、用户工具类
  }

  // 加载函数，dir 的 type 指定加载结果类型，默认 dir 为 string，加载结果为 object
  private async load(dir: any): Promise<void> {
    this.app.log(`加载 ${dir.name ? dir.name : dir}`);
    const { app } = this;
    const dirPath: string = dir.name ? app.path[dir.name] : app.path[dir];
    let filenames: string[] = await app.lib.getDirFils(dirPath);
    switch (dir.type) {
      case 'array': // function[]
        filenames = app.config.middleware;
        this[dir.name] = filenames.map(name => require(`${dirPath}${name}`));
        break;
      default: // 结果是个对象，包含很多个 class 的实例
        this[dir] = {};
        filenames.forEach(name => {
          this.app.log(`加载 ${dir}：${name}`, true);
          const key: string = name.split('.ts')[0]; // 准备 key
          const theClass = require(`${dirPath}${name}`); // 加载 class
          this[dir][key] = new theClass(this.app); // 实例化
        });
    }
  }

  // 执行中间件
  public async execMiddleware(...params): Promise<void> {
    for (let i = 0; i < this.middleware.length; i++) {
      await this.middleware[i](...params);
    }
  }
}
