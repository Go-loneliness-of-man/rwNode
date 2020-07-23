
module.exports = {
  port: 2333, // 监听端口
  middleware: [], // 启用的中间件，执行顺序与数组顺序相同
  header: { 'Content-Type': 'application/json' }, // 配置响应体 header
  outInfo: true, // 开启调试模式，会输出框架运行各部分关键信息，可在开发时使用
  outAllInfo: false, // 输出所有框架运行调试信息，仅作修改框架时使用
}

























