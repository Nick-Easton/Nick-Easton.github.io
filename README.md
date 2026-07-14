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

## 项目结构

```text
my-blog/
├─ index.html                 # 首页
├─ categories.html            # 分类
├─ archives.html              # 归档
├─ search.html                # 搜索
├─ changelog.html             # 更新日志
├─ about.html                 # 关于我
├─ CONTRIBUTING.md            # 博客维护格式
├─ AGENTS.md                  # Codex 项目规则
├─ articles.js                # 统一文章数据
├─ listing.js                 # 分类与归档渲染
├─ search.js                  # 搜索逻辑
├─ style.css                  # 全站样式
├─ posts/                     # 文章详情页
└─ .github/                   # PR 模板与 CloudBase 工作流
```

## 本地预览

在项目目录运行：

```powershell
python -m http.server 8000
```

然后访问 <http://127.0.0.1:8000/>。

## 发布方式

- 代码通过 Git 管理并推送到 GitHub。
- GitHub Pages 提供源站访问。
- 腾讯云 CloudBase 提供国内访问镜像。
- CloudBase 当前采用手动部署，避免 GitHub 账单锁定影响正常更新。
- GitHub Actions 工作流暂时只允许手动触发，待账号状态恢复后再考虑启用自动发布。
