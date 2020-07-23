
/*
  1、基于 node.js + ts 实现

  2、规范
    1、请求、响应默认采用 json 格式，建议请求头设置 'Content-Type': 'application/json'
    2、仅支持 get、post、put、delete 请求

  3、特性
    1、支持 params 路由参数

  4、主要对象
    1、app，框架全局对象，包含 ctx、lib、router、config、公共控制器 pubC、服务 pubS、模型 pubM 等框架核心对象
    2、ctx，上下文对象，负责业务所需数据，包含所有 controller、service、model、lib、plugin、request（req）、response（res），以及 params（无论 get、post、put ... 任意类型请求，统一在这里获取所有参数）
    3、pubC、pubS、pubM，公共控制器、服务、模型

  5、目录结构
    app、config、core、plugin 4 个目录，app 内是 controller、service、model、lib、route 等业务代码，core 是框架核心目录、route 用来定义路由

  6、其它
    1、控制器执行环境为公共控制器的 this，若要调用控制器方法需通过 this.ctx.controller.test.get(); 的形式来调用
    2、公共模型、公共服务还在想，没实现
    3、
*/








