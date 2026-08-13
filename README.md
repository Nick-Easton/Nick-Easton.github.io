# Nick の Blog

一个持续生长的个人博客，用来记录嵌入式学习、前端实践、项目经验与生活灵感。

## 访问地址

- GitHub Pages：<https://nick-easton.github.io/>
- 国内访问镜像：<https://nick-blog-test-d6gor1sd1da2c5d15-1317650894.tcloudbaseapp.com/>

## 已实现功能

- 响应式个人首页与统一导航
- 文章详情页、阅读进度和页面平滑过渡
- 按主题浏览的文章分类
- 按时间整理的文章归档
- 基于文章数据的站内搜索
- 腾讯云 CloudBase 国内访问镜像
- 独立更新日志页面
- 面向访客公开的生活日记列表与正文页
- 仅限博主邮箱密码登录的日记管理后台
- 全站导航与日记页均提供清晰的管理员登录入口
- 日记草稿、实时预览、图片上传、发布与内容管理

## 更新日志

网站的功能、界面、内容结构和部署方式发生值得记录的变化时，会同步更新 [`changelog.html`](./changelog.html)。

每条日志包含：

1. 版本号与更新日期；
2. 更新类型；
3. 面向访客的变化；
4. 重要的技术调整。

## 维护规范

- [`CONTRIBUTING.md`](./CONTRIBUTING.md)：统一更新日志、Git 提交和 GitHub PR/Conversation 的说明格式；
- [`AGENTS.md`](./AGENTS.md)：让后续 Codex 对话自动遵守同一套项目规则；
- [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md)：创建 PR 时自动生成检查与说明结构。

## 固定更新流程

每次修改都按照同一个闭环执行：

1. 修改并完成本地验证；
2. 更新网站内的 `changelog.html`；
3. 需要时同步 README 和维护说明；
4. 创建 Git 提交并推送 GitHub；
5. 更新当前 PR Conversation，写明改动、验证和发布影响；
6. 手动部署 CloudBase；
7. 检查实际线上文件后再确认发布完成。

无论改动大小，都不能省略更新日志与 GitHub 说明；很小的连续调整可以合并记录在同一个尚未发布版本中。

## 项目结构

```text
my-blog/
├─ index.html                 # 首页
├─ categories.html            # 分类
├─ archives.html              # 归档
├─ search.html                # 搜索
├─ changelog.html             # 更新日志
├─ diary.html                 # 公开日记列表
├─ diary-post.html            # 公开日记正文
├─ diary.js                   # 日记列表读取与渲染
├─ diary-post.js              # 日记正文读取与渲染
├─ diary-markdown.js          # 安全的轻量正文格式渲染
├─ cloudbase-config.example.js# 可提交的 CloudBase 配置模板
├─ cloudbase-config.js        # 不纳入 Git 的实际浏览器运行配置
├─ cloudbase-client.js        # CloudBase 前端连接层
├─ about.html                 # 关于我
├─ favicon.jpg                # 浏览器标签页图标
├─ CONTRIBUTING.md            # 博客维护格式
├─ AGENTS.md                  # Codex 项目规则
├─ articles.js                # 统一文章数据
├─ listing.js                 # 分类与归档渲染
├─ search.js                  # 搜索逻辑
├─ style.css                  # 全站样式
├─ admin/                     # 管理员登录与日记编辑后台
├─ cloudbase/                 # 数据库、存储规则及首次配置说明
├─ posts/                     # 文章详情页
└─ .github/                   # PR 模板与 CloudBase 工作流
```

## 本地预览

在项目目录运行：

```powershell
python -m http.server 8000
```

然后访问 <http://127.0.0.1:8000/>。

## 日记发布系统

- 访客通过 [`diary.html`](./diary.html) 阅读已发布日记，不需要注册或登录。
- 博主通过 `admin/login.html` 使用 CloudBase 邮箱和密码进入管理后台。
- 管理员邮箱和密码不保存在仓库；页面登录后还会使用唯一 UID 校验发布权限。
- 部署配置只保存管理员邮箱的小写 SHA-256 摘要，不公开邮箱明文。
- 公开日记读取使用 CloudBase Publishable Key；它只有访客级权限，不能替换成管理员 API Key 或腾讯云密钥。
- 浏览器端使用 CloudBase Web SDK v3，使身份认证请求与当前 HTTP API 网关保持一致。
- 日记正文保存在 CloudBase 文档数据库的 `diary_posts` 集合，数据库规则只允许唯一管理员 UID 写入；图片保存在 PostgreSQL 模式的 `diary-images` Bucket。
- `diary-images` 使用 RLS 实现访客公开读取、唯一管理员 UID 写入，并限制为 JPG、PNG、WebP 与单文件 8 MB；网站不提供访客注册或上传入口。
- 图片上传使用 Web SDK v3 的 PG 云存储客户端 `app.storage.from('diary-images')`，对象路径按 `<管理员 UID>/<文件名>` 隔离。
- 首次开通身份认证、创建集合、绑定 UID 和应用安全规则时，请按照 [`cloudbase/SETUP.md`](./cloudbase/SETUP.md) 操作。

日记属于动态内容：网站程序部署完成后，博主可以在管理后台直接发布，无需为每篇日记重新提交 Git 或部署静态文件。日记系统自身的代码、样式与配置改动仍然必须遵循本仓库的固定更新流程。

## 发布方式

- 代码通过 Git 管理并推送到 GitHub。
- GitHub Pages 提供源站访问。
- 腾讯云 CloudBase 提供国内访问镜像。
- CloudBase 当前采用手动部署，避免 GitHub 账单锁定影响正常更新。
- GitHub Actions 工作流暂时只允许手动触发，待账号状态恢复后再考虑启用自动发布。
