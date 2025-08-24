## 工程结构
1. 在这个项目的脚手架代码中，我们提供了两个业务端，一个是用户端，一个是管理员端，默认情况下：
2. 用户端的前端网址是 `http://mydomain.com`，管理员端的前端网址是 `http://mydomain.com/admin`
3. 用户端的后端 API 前缀是 `/api/`，管理员端的后端 API 前缀是 `/api/admin/`
4. 在脚手架中，我们已经提供了用户端的登录系统和注册系统，管理员端的登录系统（不能管理端注册，基于 seed data 在初始化时注入管理员账号）
5. 用户端的登录系统和注册系统是完全独立的，管理员端的登录系统和注册系统也是完全独立的


## 前端页面开发
1. 所有的前端页面都必须使用 zustand store 来进行数据的管理，禁止从 page 中直接发起 API 调用
2. 所有的业务需求都尽可能集中在一个 store 中，不要每新增一个页面就新增一个store，除非用户有明确的要求
3. 严禁从 page 中直接发起 HTTP 请求，只能从 store 中发起
4. HTTP 请求必须使用 `client/src/lib/api.ts` 中的 API 接口，这个接口可以确保自动处理 auth 相关流程
5. 初始模板中所有的 API 请求都是基于 `/api/...` 开头的，比如 `await api.get('/api/users')`，除非用户有修改过，如果你不确定，请读取 `server/routers/index.ts` 文件进行确认
6. `client/src/pages/LandingPage.tsx` 是整个前端网站的入口页面，所以无论是开发什么类型的产品都需要根据用户的真实需求重构这个页面，从而为用户提供**优雅**的用户体验。
7. 为了方便用户快速上手，我们需要在入口页面提供后台的登录按钮.
    - 用户登录页面 `client/src/pages/users/login.tsx`
    - Admin 登录页面 `client/src/pages/admin/login.tsx`
请根据具体需求和真实的开发情况，提供用户登录按钮或者 Admin 登录按钮，亦或者这两个都提供。
8. 优先使用 seed data 模式来提前构建测试数据，避免在前端页面中写入 Mock Data

## 服务端开发
1. 所有 API 的注册都在 `server/routers/index.ts` 文件中进行
2. 所有涉及需要 Auth 的 API 都在 `server/routers/index.ts` 文件中按照顺序进行注册，禁止在 API 的实现代码中添加 auth 中间件，也不能修改 `server/middleware/route-auth.ts` 中的代码来解决 Auth 问题，除非用户有明确的要求。
