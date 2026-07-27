# cleftgou's blog

基于 [Fuwari](https://github.com/saicaca/fuwari) 主题搭建的个人技术博客，使用 [Astro](https://astro.build) + Svelte + Tailwind CSS 构建。

[**🖥️ Live**](https://blog-cleftgou.vercel.app)

## ✨ Features

- 基于 Astro 静态生成，性能优秀
- 暗色 / 亮色模式
- 自定义主题色 & Banner
- Pagefind 全文搜索
- 文章目录（TOC）
- 归档页（时间线 + 标签 / 分类筛选）
- 相册页（时间线 + 缩略图 + PhotoSwipe 灯箱）
- APlayer 音乐播放器（侧栏卡片，网易云歌单）
- 数学公式（KaTeX）、GitHub 仓库卡片、提示框、代码块增强
- RSS 订阅 / Sitemap

## 🚀 Quick Start

```bash
pnpm install
pnpm dev        # 开发 → http://localhost:4321
pnpm build      # 生产构建 → dist/
pnpm preview    # 本地预览构建产物
pnpm new-post title  # 新建文章
```

## 📝 Post Frontmatter

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: A short description.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
---
```

## 📁 Deploy

Vercel 一键部署（框架选 Astro，输出目录 `dist`）。

---

> Theme by [saicaca/fuwari](https://github.com/saicaca/fuwari) · MIT License