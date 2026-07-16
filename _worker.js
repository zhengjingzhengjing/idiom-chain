// 创建一个后端入口文件_worker.js，告诉 Cloudflare “我不只是静态网页，我还有逻辑要跑”。这样才能设置变量
export default {
  async fetch(request, env) {
    // 这里 env.YOUR_SK 就是你之前在 Cloudflare 后台配置的变量
    const url = new URL(request.url);
    
    // 简单的示例：如果请求 /api/test，就返回 Key（实际使用中请做转发）
    if (url.pathname === '/api/test') {
       return new Response("Key is: " + env.YOUR_SK); 
    }
    
    // 其他请求继续作为静态网站处理
    return env.ASSETS.fetch(request);
  },
};