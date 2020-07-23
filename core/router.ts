
const assert = require('assert').strict; // 严格模式
import fs = require('fs');

module.exports = class router {

  private GET: object; // 路由 tree
  private POST: object; // 路由 tree
  private PUT: object; // 路由 tree
  private DELETE: object; // 路由 tree
  private app: any;

  constructor(app: any) {
    const treeName = ['GET', 'POST', 'PUT', 'DELETE'];
    treeName.forEach(name => this[name] = { params: {} }); // 初始化
    this.app = app;
    this.loadRoute();
  }

  // 加载路由
  private async loadRoute(): Promise<void> {
    const { app } = this;
    const dirPath: string = app.path.router;
    const filenames: string[] = await app.lib.getDirFils(dirPath);
    this.app.log(['加载路由文件：', filenames]);
    filenames.forEach(name => require(`${dirPath}${name}`)(app));
    this.app.log('路由加载完毕');
  }

  public get(path: string, callback: Function): void { this.generateTree('GET', path, callback); } // 注册 get 路由
  public post(path: string, callback: Function): void { this.generateTree('POST', path, callback); } // 注册 post 路由
  public put(path: string, callback: Function): void { this.generateTree('PUT', path, callback); } // 注册 put 路由
  public delete(path: string, callback: Function): void { this.generateTree('DELETE', path, callback); } // 注册 delete 路由

  // 路由 /k1/:k/k2 生成到路由 tree 的格式为 { k1: { params: { k: { params: {}, k2: { params:{}, value: callback } } } } }，即对应 k1.params.k.k2.value，其中 params 代表该节点下的所有 params 参数节点
  private generateTree(type: string, path: string, callback: Function): void {
    this.app.log(['构建路由 tree，将', path, '添加到', type], true);
    const keys: string[] = path.split('/').slice(1); // 从下标 1 处截取
    const end: number = keys.length - 1; // 获取末尾下标
    this.checkPath(keys, this.app.lib.deepCopy(this[type])); // 验证路由规则是否非法
    this.app.lib.reduce(keys, (leaf, key, index) => { // 生成节点
      const root: object = index ? (key.includes(':') ? leaf.params : leaf) : this[type]; // 判断父节点
      const nodeKey: string = key.includes(':') ? key.split(':')[1] : key; // 处理 key 的格式
      return this.generateNode(root, nodeKey, index, end, callback); // 生成子节点
    });
    this.app.log([type, '：', this[type]], true);
  }

  // 生成子节点
  private generateNode(leaf: object, key: string, index: number, end: number, callback: Function): object {
    leaf[key] ? 1 : leaf[key] = { params: {} }; // 该级路由已存在则不做操作，不存在则初始化
    index === end ? leaf[key].value = callback : 1; // 判断路由是否结束，若是则注册回调到上边，否则不做操作
    return leaf[key];
  }

  // 验证路由是否非法，通过 assert 抛出错误信息
  // 1、第一级路由不能是 params 参数。  2、任意一级路由不能是字符串 “params”，并且有且只能有一个 :，: 必须在开头。  3、路由不能重复注册
  // 4、对于 params 传参方式，不能同时存在 /p/:c/asd、/p/:a/:b 的路由被注册，即二者必须存在不同的任意一级非参数路由。
  private checkPath(keys: string[], tree: object): void {
    let repeat: any = tree; // 初始化查重指针
    const match: RegExp = /^:?[a-z,A-Z,0-9,_]+$/i; // 校验规则
    const checkString: string[] = ['params', ':params']; // 保留字数组
    const toString: string = keys.reduce((t, v, i) => i > 1 ? `${t}/${v}` : `/${t}/${v}`); // 拼接 keys，用于错误信息
    assert.ifError(keys[0].includes(':') ? `根路由不能是参数：${keys[0]}` : null); // 验证第一级路由不是 params 参数
    keys.forEach((key: string, index: number) => { // 遍历 key
      checkString.forEach(v => assert.ifError(key === v ? `任意一级路由不能是保留字 ${v}` : null));
      assert.ifError(match.test(key) ? null : `${key} 不合法，路由命名最多只能有一个 : 在开头，并且由数字、字母、下划线组成`);
      if (repeat) // 上一级路由已注册，继续向下查找
        repeat = key.includes(':') ? repeat.params[key] : repeat[key]; // 判断是路由还是路由参数
    });
    assert.ifError(repeat && repeat.value ? `路由 ${toString} 重复注册` : null); // 判断是否重复注册，若是抛出错误信息
    this.checkPathFour(keys, tree, 0, `路由 ${toString} 与已有路由存在可能重复的情况`); // 验证情况 4
  }

  // 验证情况 4，根据 keys 遍历 tree，若 keys 方是 params 则递归该层所有节点，若 keys 方是字符串则递归所有是 params 的节点和与 keys 方相等的节点
  // 当 keys 到末尾时若存在有 value 的节点，若任意一方是 params 参数则抛出错误，若二者都是字符串则进行比较，相等则抛出错误
  // 待简化，目前的思路较复杂，导致实现代码较冗长，待优化点，可通过 Object.keys() 一次将 key 取出，之后通过 forEach 遍历减少代码量
  private checkPathFour(keys: string[], tree: any, index: number = 0, msg): void {
    if (index >= keys.length) return; // 下标越界，直接结束
    const end: boolean = index === keys.length - 1; // 末尾标记
    const paramsKeys = Object.keys(tree.params); // 取出所有 params 节点 key
    const nodeKeys = Object.keys(tree); // 取出所有普通节点 key
    paramsKeys.forEach(v => this.checkPathFour(keys, tree.params[v], index + 1, msg)); // 递归该层所有 params 节点
    if (keys[index].includes(':'))  // keys 是 params
      nodeKeys.forEach(v => this.checkPathFour(keys, tree[v], index + 1, msg)); // 递归该层所有非 params 节点
    else // 双方都是字符串，当二者相等时遍历
      nodeKeys.forEach(v => v === keys[index] ? this.checkPathFour(keys, tree[v], index + 1, msg) : '');
    if (end) {
      this.app.log(['验证路由情况 4', '：', keys[index], tree], true);
      if (keys[index].includes(':')) { // keys 是 params 参数
        paramsKeys.forEach(v => assert.ifError(tree.params[v].value ? msg : null)); //  双方都是 params 参数，节点有 value 抛出错误
        nodeKeys.forEach(v => assert.ifError(tree[v].value ? msg : null)); // 节点是字符串，节点有 value 抛出错误
      }
      else { // keys 是字符串
        paramsKeys.forEach(v => assert.ifError(tree.params[v].value ? msg : null)); // 节点是 params 参数，节点有 value 抛出错误
        nodeKeys.forEach(v => assert.ifError((keys[index] === v) && tree[v].value ? msg : null)); // 节点是字符串，比较节点字符串，若相等且有 value 抛出错误
      }
    }
  }

  // 解析路由
  public parse(req: any): any {
    const { method, url } = req; // 取出请求类型、路径
    const tree = this[method]; // 选择 tree
    const path = url.split('/').slice(1); // 处理 url
    const end: number = path.length; // 获取末尾下标
    const callback = this.queryTree(path, 1, end, tree[path[0]]); // 查询 tree
    const defaultRes = async () => { return { code: 404, message: '未匹配到路由', result: {} } }; // 默认结果
    if(!callback) this.app.log(`未匹配到路由 ${url} 对应的节点`);
    return callback ? callback : defaultRes;
  }

  // 根据 path 查询 tree 寻找匹配的节点并从中获取 params 参数添加到 ctx.params
  // 起点在第一层，向下搜索，在每一层，递归所有 params 节点并将当前 path item 加到 params 参数中，再遍历所有普通节点，遇到匹配的便继续向下搜索
  // 当到达 end 终点时若当前节点存在 value 则匹配成功，不存在则代表未找到
  private queryTree(path: string[], index: number, end: number, tree: any, params: object = {}): any {
    if(!tree) return null;
    this.app.log([`深度 ${index} 搜索结果：`, path, path[index], tree, params], true);
    if(index === end) { // 判断是否结束递归
      this.app.log(['本次匹配结果：', path, index, tree, params], true);
      this.app.ctx.params = { ... this.app.ctx.params, ... params, }; // 与请求 body 合并
      return tree.value ? tree.value : null;
    }
    for(const nodeKey in tree.params) { // 递归所有 params 节点
      const callback = this.queryTree(path, index + 1, end, tree.params[nodeKey], { ... params, [nodeKey]: path[index] }); // 获取结果
      if(callback)  return callback; // 返回结果
    }
    for(const nodeKey in tree) // 递归所有普通节点
      if(nodeKey === path[index]) { // 相同，继续搜索
        const callback = this.queryTree(path, index + 1, end, tree[nodeKey], { ... params });
        if(callback)  return callback;
      }
  }
}
