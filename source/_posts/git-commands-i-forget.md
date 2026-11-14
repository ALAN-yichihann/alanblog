---
title: Git 常用但总记不住的几条命令
date: 2026-09-08 20:45:00
categories:
  - 技术
  - Git
tags:
  - Git
  - 工具
description: 不是命令大全，只是我自己隔一段时间就要查一次的那几条，附上它们各自解决什么问题。
---

写代码的日常里，`add`、`commit`、`push` 占了九成，剩下那一成才是真正需要翻文档的。这里记的都是我反复忘记、又反复用到的命令。

## 撤销：三种场景

### 文件改坏了，还没 add

```bash
git restore path/to/file
```

### 已经 add 了，想撤出暂存区

```bash
git restore --staged path/to/file
```

### 已经 commit 了，但没 push

```bash
git reset --soft HEAD~1
```

`--soft` 保留改动在暂存区，`--mixed`（默认）保留在工作区，`--hard` 直接扔掉。三个选项里，`--hard` 用之前一定要看清楚。

## 找到是哪次提交弄坏的

```bash
git log -S "某个字符串" --oneline
```

`-S` 会找出增加或删除了这段内容的提交。排查“这行代码什么时候没的”特别有效。

## 只想看某个文件的历史

```bash
git log --oneline --follow -- path/to/file
git blame path/to/file
```

`--follow` 能跟踪重命名。`blame` 适合追一行代码是谁写的，但不适合追责——很多时候写它的人和改它的人不是同一批。

## 临时保存现场

```bash
git stash push -m "调试到一半"
git stash list
git stash pop
```

切换分支前用一下，比匆忙提交一个 `wip` 干净。注意 `stash` 不包含未跟踪文件，需要的话加 `-u`。

## 清理分支

```bash
git branch --merged main | grep -v main | xargs -r git branch -d
git fetch --prune
```

第一条删掉已经合进主分支的本地分支，第二条清掉远端已经删除的引用。定期跑一遍，`git branch` 的输出会清爽很多。

## 关于 rebase 的一条底线

只在**自己独占的分支**上 rebase。已经推给别人、别人可能已经拉取过的分支，不要 rebase，会制造一堆重复提交和冲突。

如果实在需要，用 `--force-with-lease`，别用 `--force`。前者在远端有新提交时会拒绝推送，能救你一命。

## 最后

这些命令都不难，难的是在真正需要的时候想起来它们。我的办法是把它们写在仓库的 `NOTES.md` 里，随项目走，比收藏夹靠谱。
