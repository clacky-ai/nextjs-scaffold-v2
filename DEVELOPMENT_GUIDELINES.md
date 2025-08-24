## 前端页面开发
1. 所有的前端页面都必须要配套一个 zustand store ，禁止从 page 中直接发起 API 调用，可以参考 `client/src/stores/admin/userStore.ts`
2. HTTP 请求必须使用 `client/src/lib/api.ts` 中的 API 接口，这个接口可以确保自动处理 auth 相关流程
3. `client/src/pages/LandingPage.tsx` 是整个前端网站的入口页面，所以无论是开发什么类型的产品都需要根据用户的真实需求重构这个页面，从而为用户提供**优雅**的用户体验。
4. 为了方便用户快速上手，我们需要在入口页面提供后台的登录按钮.
    - 用户登录页面 `client/src/pages/users/login.tsx`
    - Admin 登录页面 `client/src/pages/admin/login.tsx`
请根据具体需求和真实的开发情况，提供用户登录按钮或者 Admin 登录按钮，亦或者这两个都提供。

5. 优先使用 seed data 模式来提前构建测试数据，避免在页面中写入 Mock Data