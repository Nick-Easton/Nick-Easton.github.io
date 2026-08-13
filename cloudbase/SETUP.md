# CloudBase 日记功能配置

本目录保存日记发布功能需要在 CloudBase 控制台手动应用的安全规则模板。这里不能保存管理员邮箱、密码、访问令牌或腾讯云密钥。

## 首次配置顺序

1. 在 CloudBase 控制台的“身份认证 / 登录方式”中开启账号密码登录。
2. 使用邮箱验证码注册或在控制台创建唯一的管理员用户，并为账号设置密码；网站不提供访客注册入口。
3. 在“环境配置 / 安全配置”中添加：
   - `127.0.0.1:8000`（本地调试）；
   - `nick-blog-test-d6gor1sd1da2c5d15-1317650894.tcloudbaseapp.com`（线上镜像）；
   - `nick-easton.github.io`（GitHub Pages）。
4. 复制 `cloudbase-config.example.js` 为不纳入 Git 的 `cloudbase-config.js`，在“API Key 配置”中创建 Publishable Key 并填入。Publishable Key 只代表公开访客权限，可以放在浏览器端；不要填入 API Key、SecretId 或 SecretKey。
5. 打开 `/admin/login.html`，登录后复制页面显示的当前 UID。
6. 将管理员邮箱的小写 SHA-256 摘要、CloudBase 内部用户名和 UID 填入不纳入 Git 的 `cloudbase-config.js`，并用 UID 配置以下两份规则。不要把邮箱明文放进需要部署的浏览器配置：
   - `cloudbase/database.rules.json`；
   - `cloudbase/storage.rules.json`。
   - 内部用户名需兼容 Web SDK v2：使用 5～24 位英文字母、数字、`_` 或 `-`，不要直接使用含 `@` 的邮箱。
7. 在 CloudBase 文档数据库中新建集合 `diary_posts`，进入权限管理并切换到安全规则，把 `database.rules.json` 的内容粘贴应用。
8. 若环境支持旧云存储自定义规则，在 CloudBase 云存储中应用 `storage.rules.json`。当前环境同时存在 PostgreSQL，CloudBase 会拒绝修改旧云存储自定义规则，因此保留平台默认的 `READONLY`（公开读取，仅上传者和管理员可写）。
9. 等待规则生效后重新登录，测试草稿、图片上传、发布和访客读取。

## 权限效果

- 未登录访客只能读取 `status` 为 `published` 的日记。
- 草稿只有配置好的管理员 UID 能读取。
- 只有该管理员 UID 能新增、修改或删除日记。
- 理想规则下，`diary-public/` 中的图片允许访客读取，但只有管理员 UID 能写入。
- 当前环境的实际云存储规则是 `READONLY`：所有人可读，仅文件上传者和环境管理员可写；网站没有访客注册和上传入口。

管理员 UID 用于权限匹配，不是密码或令牌；密码始终只提交给 CloudBase 身份认证。
