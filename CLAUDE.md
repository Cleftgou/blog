# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在本仓库中工作提供指导。

## 项目概览

Fuwari — 基于 [Astro](https://astro.build) 5.13 + Svelte 5 + Tailwind CSS 3 构建的静态博客。基于 [saicaca/fuwari](https://github.com/saicaca/fuwari) 模板，已做个人定制。

**包管理器**：仅限 pnpm 9.14.4（通过 `preinstall` 脚本强制）。

## 命令

| 命令 | 说明 |
|---------|-------------|
| `pnpm dev` | 启动开发服务器 `localhost:4321` |
| `pnpm build` | 生产构建（`astro build` + Pagefind 索引） |
| `pnpm preview` | 预览生产构建 |
| `pnpm check` | Astro 类型检查 |
| `pnpm format` | 使用 Biome 格式化 |
| `pnpm lint` | 使用 Biome 检查并自动修复 |
| `pnpm new-post <文件名>` | 在 `src/content/posts/` 中生成新的 Markdown 文章 |
| `pnpm type-check` | 完整 TypeScript 检查（`tsc --noEmit`） |

## 内容

- **博客文章**以 `.md` 文件形式存放在 `src/content/posts/` 中。Frontmatter schema 在 `src/content/config.ts` 中通过 Zod 定义。
- **每页条数**：每页 8 篇文章（`src/constants/constants.ts` 中的 `PAGE_SIZE`）。
- 草稿（`draft: true`）在生产构建中会被排除。

## 架构

### 配置 (`src/config.ts`)
配置中心，导出：`siteConfig`、`navBarConfig`、`profileConfig`、`licenseConfig`、`expressiveCodeConfig`。类型定义在 `src/types/config.ts`。

### 布局
- `Layout.astro` — HTML 外壳：`<head>` 含 SEO/元标签/favicon、主题初始化脚本、PhotoSwipe、OverlayScrollbars、自定义滚动条、Swup 页面过渡钩子。同时加载 APlayer + MetingJS CDN 脚本。
- `MainGridLayout.astro` — 完整页面网格，含 Navbar、SideBar（小部件）、TOC、BackToTop、Footer、Banner 图。

### 页面
- `[...page].astro` — 分页文章列表（首页）
- `posts/[...slug].astro` — 单篇文章，含 Markdown 渲染、文章元信息、上下篇导航、JSON-LD
- `archive.astro` — 归档页，支持标签/分类筛选
- `about.astro` — 独立的关于页面
- `album.astro` — 相册（自定义功能）
- `rss.xml.ts` / `robots.txt.ts` — RSS 订阅和 robots.txt 端点

### 组件
- **`widget/`** — 侧边栏小部件：Profile、TOC、Categories、Tags、Music（APlayer + MetingJS）、Search（Svelte + Pagefind）、DisplaySettings（Svelte，主题/色调选择器）、NavMenuPanel、WidgetLayout、SideBar
- **`misc/`** — Markdown 渲染器、ImageWrapper、License
- **`control/`** — BackToTop、ButtonLink、ButtonTag、Pagination
- Svelte 组件（`.svelte`）：Search、ArchivePanel、LightDarkSwitch、DisplaySettings

### 插件 (`src/plugins/`)
`astro.config.mjs` 中的 Remark/rehype 处理链：
1. `remark-math` → `remark-reading-time` → `remark-excerpt` → `remark-github-admonitions-to-directives` → `remark-directive` → `remark-sectionize` → `parseDirectiveNode`
2. `rehype-katex` → `rehype-slug` → `rehype-components`（提示框、GitHub 卡片） → `rehype-autolink-headings`

### 国际化 (`src/i18n/`)
支持 10 种语言。翻译键类型在 `i18nKey.ts`，语言包在 `languages/`。网站语言通过 `src/config.ts` 中的 `siteConfig.lang` 设置。

### 样式 (`src/styles/`)
- `variables.styl` — CSS 自定义属性（通过 `--hue` 生成主题色）
- `main.css` — 全局样式
- `markdown.css` / `markdown-extend.styl` — 文章内容样式
- `transition.css` — Swup 页面过渡动画
- `scrollbar.css` — OverlayScrollbars 主题
- `photoswipe.css` / `expressive-code.css` — 组件覆盖样式

### 关键集成
- **Swup** (`@swup/astro`) — 类 SPA 页面过渡，钩子在 `Layout.astro` 中
- **Pagefind** — 静态搜索，在 `pnpm build` 时构建，UI 在 `Search.svelte` 中
- **PhotoSwipe** — 文章图片和相册网格的灯箱浏览
- **Expressive Code** — 代码块语法高亮，支持可折叠区域、行号、自定义复制/语言徽章插件
- **KaTeX** — 数学公式渲染，通过 `remark-math` + `rehype-katex`
- **OverlayScrollbars** — 自定义滚动条
- **APlayer + MetingJS** — 音乐播放器小部件，通过 CDN 加载

## 重要约束

- **不要升级 Astro** — 锁定在 5.13.10。
- **图片**：直接使用原图；构建过程会自动优化（sharp）。不要手动压缩图片。
- 主题使用单一色调值（`--hue` CSS 变量）生成整个色板。主题色通过 `siteConfig.themeColor.hue` 配置（默认 250）。
- 已设置 `trailingSlash: "always"` — 所有 URL 以 `/` 结尾。
- CSS 同时使用 Tailwind 层和 Stylus（`.styl`）文件。PostCSS 配置支持 `postcss-import` + `postcss-nesting`。
