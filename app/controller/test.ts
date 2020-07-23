
const pubC = require('../../core/pubC.ts');

module.exports = class test extends pubC {
  
  public async get(): Promise<any> {
    console.log('执行了路由 /test/get 和 /test/get/a 对应的操作');
  }

  public async post(): Promise<any> {
    console.log('执行了路由 /test/post 对应的操作');
  }

  public async paramsA(): Promise<any> {
    console.log('执行了路由 /test/p/:c/asd 对应的操作');
  }

  public async paramsB(): Promise<any> {
    console.log('执行了路由 /test/p/:a/:b 对应的操作');
    const { ctx, ctx: { lib: { test } } } = this;
    test.test();
    this.ctx.plugin.test.test();
    // this.ctx.controller.test.get(); // 由于控制器的作用域是公共控制器，所以不能直接通过 this.get() 调用自身方法
    return this.stdRes(ctx.params);
  }
}










