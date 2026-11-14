---
title: 把博客搬回自己的服务器
date: 2026-11-12 21:40:00
updated: 2026-11-13 09:12:00
categories:
  - 技术
  - 运维
tags:
  - Hexo
  - Nginx
  - 部署
description: 从托管平台搬回一台小机器，顺手把证书、自动发布和备份都重新理了一遍。
---

托管平台用久了，会慢慢忘记“网站其实是一堆文件”这件事。这次把博客搬回自己的服务器，前后折腾了两个晚上，记一下过程里比较值得留下的部分。

## 为什么要搬

理由不复杂：

- 想自己控制构建流程，不再被平台的 Node 版本卡住
- 想给文章加一些平台不支持的静态资源处理
- 想顺便练一遍从零配置 Nginx 和证书

搬之前先把旧站全量导出，确认文章、图片、评论都拿到了，再动手。

## 服务器上的目录结构

习惯把站点和发布目录分开，这样重建时不会把内容一起清掉：

```bash
/var/www/blog/
├── source/      # Hexo 源码
├── releases/    # 每次构建产物
└── current -> releases/20261112-2140
```

`current` 是一个软链接，Nginx 直接指向它。回滚的时候只改链接，不动机器上的其他东西。

## Nginx 的配置

静态站点其实只需要很少几行，关键是缓存和 404：

```nginx
server {
    listen 443 ssl http2;
    server_name blog.example.com;

    root /var/www/blog/current;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    location ~* \.(css|js|png|jpg|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    error_page 404 /404.html;
}
```

`try_files` 里加上 `$uri.html` 是因为 Hexo 默认生成的是 `about/index.html` 这类目录形式，写死 `$uri/` 会让部分链接绕一圈 301。

### 证书与续期

证书用 `certbot` 申请，续期交给系统的定时任务。留一条手动检查命令在手边：

```bash
sudo certbot renew --dry-run
```

## 自动发布脚本

发布脚本放在站点根目录，逻辑只有三步：拉代码、构建、切链接。

```bash
#!/usr/bin/env bash
set -euo pipefail

STAMP=$(date +%Y%m%d-%H%M)
cd /var/www/blog/source
git pull --ff-only
npx hexo clean
npx hexo generate
mv public "/var/www/blog/releases/$STAMP"
ln -sfn "/var/www/blog/releases/$STAMP" /var/www/blog/current
```

保留最近十次发布，旧的用 `find` 清掉，磁盘压力不大。

## 搬完之后的变化

最直接的感受是**构建时间可控**了。以前在平台上点一下发布要等几分钟，现在本地跑完 `hexo generate` 只要几秒，剩下的只是同步文件。

还有一点是备份变简单了：源码在 Git 里，发布产物在 `releases/` 里，图片跟着源码走。整台机器挂掉，重新装一遍也花不了太久。

## 接下来想做的

- 把图片压缩接进构建流程
- 给文章加一个简单的阅读量统计
- 写一个真正能用的 404 页

搬站这件事本身不复杂，复杂的是搬完之后想改的东西会变多。
