
module.exports = class pubC {

  public app: any;
  public ctx: any;

  constructor(app) {
    this.app = app;
    this.ctx = app ? app.ctx : {};
  }

  // 标准返回方法
  public stdRes(res: object = {}, code: number = 200, msg: string = 'success') {
    return { code, msg, res };
  }
}










