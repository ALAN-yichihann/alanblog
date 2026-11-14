# 项目说明（AGENTS.md）

这是 `hexo-theme-hsad` 的本地预览站点，用来演示主题在真实内容下的样子。

## 目录结构

```text
alanblog/
├── hexo-theme-hsad/        # 从 GitHub 克隆的主题仓库（保持原样，可单独更新）
└── preview-blog/           # Hexo 站点
    ├── _config.yml         # 站点配置（标题、URL、生成器、代码高亮）
    ├── package.json        # 依赖与 hexo 版本声明
    ├── scaffolds/          # 新建文章的模板
    ├── source/
    │   ├── _posts/         # 示例文章（8 篇公开 + 1 篇 hide: true）
    │   ├── about/          # 关于页
    │   ├── links/          # 友链页（layout: links）
    │   ├── categories/     # 分类页（layout: categories）
    │   ├── tags/           # 标签页（layout: tags）
    │   ├── search/         # 搜索页（layout: search）
    │   ├── images/         # 头像、侧栏背景、文章插图
    │   ├── favicon.ico     # 站点图标
    │   └── 404.md          # 404 页（layout: 404）
    ├── themes/hsad/        # 主题副本（由 hexo-theme-hsad 复制而来）
    └── public/             # 生成产物（不入库）
```

`themes/hsad/` 与 `hexo-theme-hsad/` 的区别：前者是站点使用的副本，改了不影响克隆的仓库；以后更新主题时，把新版本重新复制过来即可。

## 依赖

- Hexo 8.x（`hexo`、`hexo-cli`）
- 渲染器：`hexo-renderer-marked`、`hexo-renderer-pug`、`hexo-renderer-stylus`
- 生成器：`hexo-generator-index` / `archive` / `category` / `tag` / `search`
- 代码高亮：Hexo 内置 prismjs，额外安装 `prismjs` 包
- 服务：`hexo-server`

主题自身通过 `themes/hsad/scripts/content-tools.js` 注册了 `hsad_summary`、`hsad_theme_asset` 等 helper，并把搜索模板换成 `themes/hsad/templates/search.xml`，用来过滤 `hide: true` 的文章。

## 常用命令

在本机沙箱里，`npm` 的默认缓存目录不可写，安装依赖需要把缓存放到工作区，并跳过会 spawn 子进程的 postinstall：

```powershell
cd preview-blog
$env:npm_config_cache = 'G:\programs\alanblog\.npm-cache'
$env:TMP = 'G:\programs\alanblog\.npm-tmp'
$env:TEMP = 'G:\programs\alanblog\.npm-tmp'
npm install --ignore-scripts --no-audit --no-fund
```

`hexo-cli` 直接运行，避免 `npx` 再 spawn 一层：

```powershell
# 生成静态文件
node node_modules\hexo-cli\bin\hexo generate

# 本地预览（默认 4000 端口）
node node_modules\hexo-cli\bin\hexo server -p 4000

# 清空产物
node node_modules\hexo-cli\bin\hexo clean
```

## 内容说明

示例内容按主题的能力逐项演示：

| 文件 | 演示点 |
| --- | --- |
| `migrate-blog-to-server.md` | 标题层级、目录、bash 代码块、列表 |
| `python-small-things.md` | 多段 python 代码块、三级标题 |
| `ssrf-lab-notes.md` | 独立成段的图片自动编号与题注（图 01） |
| `hexo-theme-reskin.md` | 表格、CSS 代码块 |
| `reading-night-submarine.md` | 引用块与长文排版 |
| `september-fragments.md` | 生活随笔、图片题注 |
| `git-commands-i-forget.md` | 表格与代码块混排 |
| `books-2026-h1.md` | 列表为主的短篇 |
| `hidden-placeholder.md` | `hide: true`：链接可直接访问，但不进列表、分类、标签和搜索 |

## 已知问题与处理

主题在“友链没有头像”时，`.friend-card` 的两列 grid 会把文字挤进 3.4rem 的头像列。站点在 `themes/hsad/source/css/hsad-theme.css` 末尾追加了一条补丁：

```css
.friend-card > .friend-card__body:first-child {
  grid-column: 1 / -1;
}
```

如果重新从上游复制主题，需要重新加上这条规则。

另外，`themes/hsad/_config.yml` 已把上游仓库里的个人赞助信息换成中性示例，保留品牌名、配色和菜单结构。

### 主题与站点同名图片会互相覆盖

主题副本原本带着 `themes/hsad/source/images/avatar.jpg` 和 `background.png`，与站点 `source/images/` 下的同名文件冲突。实测构建时**主题那份会覆盖站点那份**：站点头像换成新图后，`public/images/avatar.jpg` 仍是主题里的旧图。现已删除主题副本中的这两张图，头像和背景只由站点 `source/images/` 提供。

以后从上游重新复制主题时，记得删除 `themes/hsad/source/images/` 下的重复图片，否则换图不生效。

## 首页随机背景

图片放在 `source/images/backgrounds/`（jpg / png / webp / avif），无需改配置，重新生成即可生效。

行为：

- 每次打开或刷新**首页**都会重新随机一张，并记在 `sessionStorage` 的 `hsad-sidebar-background` 里
- 文章、关于、归档、分类、标签等页面优先沿用会话里的那张，站内翻页不换图
- 直接打开这些页面（会话里没有记录）时随机一次并记住，不会退回默认图
- 从文章页点回首页时会重新随机，首页本身就是“随机展示位”
- 关掉标签页再打开会重新随机

实现位置：

| 文件 | 作用 |
| --- | --- |
| `themes/hsad/scripts/backgrounds.js` | 注册 `hsad_backgrounds` helper，读取目录并拼出带 `root` 的 URL |
| `themes/hsad/layout/_partial/base.pug` | 在 `<head>` 里注入选择逻辑，写入 `--hsad-sidebar-bg` 变量 |
| `themes/hsad/layout/_partial/sidebar.pug` | 把 `sidebar_background` 写成 `--hsad-sidebar-bg-fallback` 兜底 |
| `themes/hsad/source/css/hsad-theme.css` | `.sidebar__backdrop` 用 `var(--hsad-sidebar-bg, var(--hsad-sidebar-bg-fallback))` |

因为选择逻辑写在 `<head>` 的同步脚本里，背景在首次绘制前就确定，不会出现先显示默认图再闪变的情况。

## 内容资源

- `source/images/avatar.jpg`、`background.png`：站点自己的头像与侧栏背景（主题副本里不再保留同名文件）
- `source/images/backgrounds/`：首页随机背景（4 张示例图，可随意增删）
- `source/images/ssrf-terminal.png`、`balcony-night.png`：用 Pillow 生成的示意图
- `source/favicon.ico`：按主题强调色生成的 32×32 圆角图标
