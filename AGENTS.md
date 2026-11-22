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

- **刷新任意页面**（首页、文章、关于等）都会重新随机一张，并记在 `sessionStorage` 的 `hsad-sidebar-background` 里
- 点击菜单、文章链接等站内跳转，以及前进 / 后退，都沿用会话里的那张，不换图
- 首次进入站内任意页面（会话里没有记录）时随机一次并记住，不会退回默认图
- 关掉标签页再打开会重新随机

实现上用 `performance.getEntriesByType('navigation')[0].type` 区分 `reload` 和 `navigate`，只有 `reload` 才重新选图。

实现位置：

| 文件 | 作用 |
| --- | --- |
| `themes/hsad/scripts/backgrounds.js` | 注册 `hsad_backgrounds` helper，读取目录并拼出带 `root` 的 URL |
| `themes/hsad/layout/_partial/base.pug` | 在 `<head>` 里注入选择逻辑，写入 `--hsad-sidebar-bg` 变量 |
| `themes/hsad/layout/_partial/sidebar.pug` | 把 `sidebar_background` 写成 `--hsad-sidebar-bg-fallback` 兜底 |
| `themes/hsad/source/css/hsad-theme.css` | `.sidebar__backdrop` 用 `var(--hsad-sidebar-bg, var(--hsad-sidebar-bg-fallback))` |

因为选择逻辑写在 `<head>` 的同步脚本里，背景在首次绘制前就确定，不会出现先显示默认图再闪变的情况。

背景的模糊与饱和度在 `.sidebar__backdrop` 的 `filter` 里（当前 `blur(1.5px) saturate(1)`），遮罩在 `.sidebar__overlay`，侧栏文字阴影在 `.sidebar__content`。想更清晰就调小 `blur`，想更朦胧就调大。

### 图库与登记文件

侧栏的「图库」指向 `/gallery/`，页面列出所有已登记的背景图。登记文件是 `source/_data/backgrounds.yml`，格式：

```yaml
- file: bg-blue.jpg     # 必填，必须是 source/images/backgrounds/ 下真实存在的文件名
  name: 雾蓝            # 显示名称，不必和文件名相同
  work: 无题            # 作品 / 出处
  source: 原创          # 来源
  author: Alan          # 作者
```

规则：

- 只有「已登记 + 文件存在」的图片才会进入图库和首页随机池；目录里没登记的图片会被忽略
- `name` 为空时，图库卡片显示文件名
- 想临时排除某张图，删掉它的条目即可
- 条目的顺序就是图库里的显示顺序
- 数据通过 `hsad_background_entries`（图库）和 `hsad_backgrounds`（随机池）两个 helper 读取，都定义在 `themes/hsad/scripts/backgrounds.js`

## 域名与部署路径

站点已绑定自定义域名 `www.alan-yichihann.top`，不再是 `github.io/alanblog` 子路径：

```yml
# _config.yml
url: https://www.alan-yichihann.top
root: /
```

- `source/CNAME` 内容是 `www.alan-yichihann.top`，Hexo 会把它复制到 `public/CNAME`，随部署发布到站点根目录
- GitHub 仓库 Settings → Pages → Custom domain 要填同一个域名；DNS 里给 `www` 加 CNAME 指向 `alan-yichihann.github.io`，再勾选 Enforce HTTPS
- 因为 `root` 变成了 `/`，正文里的图片写 `/images/xxx.png` 或文章资源目录的相对路径都能正确解析，**不要再写 `/alanblog/`**
- 如果以后换回项目子路径或换域名，只需要改 `url`、`root` 和 `source/CNAME` 三处，模板里的链接都走 `url_for()`，会自动跟随

## 内容资源

- `source/images/avatar.jpg`、`background.png`：站点自己的头像与侧栏背景（主题副本里不再保留同名文件）
- `source/images/backgrounds/`：背景图目录，是否参与随机和图库由登记文件决定
- `source/_data/backgrounds.yml`：图库与随机背景的登记文件（名称 / 作品 / 来源 / 作者）
- `source/gallery/index.md`：图库页，`layout: gallery`
- `source/images/ssrf-terminal.png`、`balcony-night.png`：用 Pillow 生成的示意图
- `source/favicon.ico`：按主题强调色生成的 32×32 圆角图标
