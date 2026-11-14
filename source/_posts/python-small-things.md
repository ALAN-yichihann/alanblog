---
title: Python 里那些早知道就好了的小事
date: 2026-11-03 20:15:00
categories:
  - 技术
  - Python
tags:
  - Python
  - 技巧
description: 从路径处理到 dataclass，一些写了很久才改过来的习惯，以及它们当初为什么让我踩坑。
---

用 Python 写脚本的年头不算短了，但每隔一阵回头看，总能挑出几处“当初要是早点知道就好了”的写法。这篇记的都是小事，成本很低，但改了之后代码会明显清爽一点。

## 路径别再用字符串拼接

早期写脚本，路径全靠 `os.path.join`，能跑，但读起来很吵。现在一律用 `pathlib`：

```python
from pathlib import Path

base = Path("data") / "raw"
files = sorted(base.glob("*.csv"))

for path in files:
    with path.open(encoding="utf-8") as handle:
        print(path.stem, len(handle.readlines()))
```

`Path` 是对象，可以相加、可以取 `.stem`、`.suffix`、`.parent`，不用记一堆函数名。跨平台的问题它也顺手解决了。

## 字典取值：先想默认值

`dict.get(key, default)` 人人都会用，但在嵌套结构里容易写成一层套一层：

```python
value = config.get("server", {}).get("port", 8080)
```

再深一点就难看了。这种情况我一般写个小工具函数：

```python
def dig(data, *keys, default=None):
    current = data
    for key in keys:
        if not isinstance(current, dict) or key not in current:
            return default
        current = current[key]
    return current

port = dig(config, "server", "port", default=8080)
```

## dataclass 比字典更适合“有结构的数据”

以前喜欢用字典表示配置、结果、中间状态，后来发现字段一多，拼写错误要到运行时才暴露。`dataclass` 基本没成本：

```python
from dataclasses import dataclass, field

@dataclass
class Article:
    title: str
    tags: list[str] = field(default_factory=list)
    views: int = 0

    def add_tag(self, tag: str) -> None:
        if tag not in self.tags:
            self.tags.append(tag)
```

`default_factory` 这一点值得记：可变默认值不能直接写 `tags: list[str] = []`，那是经典坑。

## 异常处理要具体

下面这段是反例：

```python
try:
    payload = json.loads(raw)
except Exception:
    payload = {}
```

它会把 `KeyboardInterrupt` 之外几乎所有问题都吞掉，包括写文件失败、编码错误。改成具体的异常类型，排查时能少掉很多头发：

```python
try:
    payload = json.loads(raw)
except json.JSONDecodeError as exc:
    print(f"JSON 解析失败：{exc}")
    payload = {}
```

## 用 `enumerate` 和 `zip` 代替下标

这条已经算常识了，但看旧代码还是能见到：

```python
for i in range(len(names)):
    print(i, names[i])
```

换成：

```python
for index, name in enumerate(names, start=1):
    print(index, name)
```

`zip` 同理，尤其是同时遍历两个列表的时候，比下标干净得多。

## 一个容易忽略的：`__slots__` 和内存

如果脚本要处理几十万个对象，普通类实例的 `__dict__` 会吃掉不少内存。加一行 `__slots__` 能省下来：

```python
class Point:
    __slots__ = ("x", "y")

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y
```

代价是不能动态加属性，也不能被多继承随便折腾。数据量不大时没必要用。

## 最后

这些写法本身都不新鲜，难的是把它们从“知道”变成“默认就这么写”。我的办法是定期翻自己的旧脚本，一次只改一类问题，改完记一行笔记。半年下来，省下的其实不是敲键盘的时间，而是读代码时那种隐隐的烦躁。
