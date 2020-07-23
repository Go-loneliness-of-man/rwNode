
module.exports = app => {
  const filename: string = 'test';
  const base: string = `/${filename}`;
  app.router.get(`${base}/get`, app.ctx.controller[filename].get); // get 示例
  app.router.get(`${base}/get/a`, app.ctx.controller[filename].get); // get 示例
  app.router.post(`${base}/post`, app.ctx.controller[filename].post); // post 示例
  app.router.get(`${base}/p/:a/:b`, app.ctx.controller[filename].paramsB); // params 传参示例
  // app.router.get(`${base}/p/:c/asd`, app.ctx.controller[filename].paramsA); // params 传参示例，该例与上例不可同时存在，因为当 route 为 test/p/asd/asd 时 /test/p/:c/asd 和 /test/p/:a/:b 同时匹配
}








