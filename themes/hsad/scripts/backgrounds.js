'use strict';

const fs = require('fs');
const path = require('path');

const IMAGE_PATTERN = /\.(?:jpe?g|png|webp|avif)$/i;

/**
 * 读取站点 source/images/backgrounds 下的图片，返回带 root 前缀的 URL 列表。
 * 首页会用这个列表随机挑一张做侧栏背景，其它页面沿用同一个会话里选中的那张。
 */
hexo.extend.helper.register('hsad_backgrounds', function () {
  const dir = path.join(hexo.source_dir, 'images', 'backgrounds');
  let files = [];

  try {
    files = fs.readdirSync(dir).filter((name) => IMAGE_PATTERN.test(name));
  } catch (error) {
    return [];
  }

  return files
    .sort()
    .map((name) => this.url_for(`/images/backgrounds/${encodeURIComponent(name)}`));
});
