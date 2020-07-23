
import util = require('util'); // 综合模块
import fs = require('fs'); // 文件操作
import iconv = require('iconv-lite'); // 用于各种编解码
import querystring = require('querystring'); // 用于解码表单数据

module.exports = class lib {

  // 获取某文件夹下所有直系文件的名称，返回 promise 对象
  public async getDirFils(path: string = __dirname): Promise<Object> {
    return new Promise((res, rej) => fs.readdir(path, 'utf8', (err, files) => err ? rej('失败') : res(files)));
  }

  // 重新实现 array 的 reduce，因为在 ts 下 array.reduce 的参数类型被限制了，与 node 的 reduce 略有不同，这里从下标 0 开始，中间变量 temp 初始值为 null
  public reduce(array: any[], callback: Function): void {
    let temp: any = null;
    array.forEach((v, i) => temp = callback(temp, v, i));
  }

  // 在控制台完整输出对象的所有信息，o 是 true 表示转换后直接输出，返回字符串数组
  public out(o: boolean, ...arr: any[]): string[] {
    const res = arr.map(v => typeof v === 'object' ? util.inspect(v, { showHidden: false, depth: null }) : v);
    if (o) console.log(...res);
    return res;
  }

  // 判断变量类型
  public type(data: any): string {
    const type: string = Object.prototype.toString.call(data).toLowerCase();
    return type.replace(/^\[object\s(\w+)\]$/, (...rest) => rest[1]);
  }

  // 递归深拷贝
  public deepCopy(x: Object): Object {
    if (this.type(x) !== 'object') return '必须传入对象'; // 若不是对象则结束
    const target: object = Array.isArray(x) ? [] : {};  // 判别是数组还是对象
    for (const k in x)  // 循环拷贝
      if (x.hasOwnProperty(k))  // 判断属性是否在对象自身上
        if (this.type(x[k]) === 'object') // 若是对象，递归
          target[k] = this.deepCopy(x[k]);
        else
          target[k] = x[k];
    return target;
  }

  // 获取请求 body，返回 promise 对象
  public async getBody(req: any, arr: any[]): Promise<any> {
    return new Promise(res => req.on('end', () => res(Buffer.concat(arr).toString())));
  }

  // 解析 contentType
  public parseContentType(data) {
    const [type, charset] = data.split(';');
    return { type, charset: charset ? charset.split('=')[1] : null };
  }

  // 解析 http request body
  public async parseBody(req: any): Promise<any> {
    const arr: any[] = []; // 数据包数组
    const { charset, type } = this.parseContentType(req.headers['content-type']); // 解析 contentType
    req.on('data', buff => arr.push(buff)); // 保存数据包
    let body = await this.getBody(req, arr); // 获取数据
    if(charset)  body = iconv.decode(body, charset); // 若存在编码类型，进行解码
    switch(type) {
      case 'text/plain':
        return { plain: body };
      case 'application/json':
        return JSON.parse(body);
      case 'application/x-www-form-urlencoded':
        return JSON.parse(JSON.stringify(querystring.parse(body)));
    }
    return body;
  }
};
