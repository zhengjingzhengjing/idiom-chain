// 创建一个后端入口文件_worker.js，告诉 Cloudflare “我不只是静态网页，我还有逻辑要跑”。这样才能设置变量
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 使用正确的环境变量名称
    if (url.pathname === "/api/test") {
      return new Response("Key is: " + env.DEEPSEEK_API_KEY);
    }

    // 其他请求继续作为静态网站处理
    return env.ASSETS.fetch(request);
  },
};
