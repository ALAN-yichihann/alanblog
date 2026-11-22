'use strict';

const fs = require('fs');
const path = require('path');

const IMAGE_PATTERN = /\.(?:jpe?g|png|webp|avif|gif)$/i;
const IMAGE_DIR = ['images', 'backgrounds'];

/**
 * 读取 source/_data/backgrounds.yml 里登记的图片。
 * 只有同时满足「已登记」和「文件确实存在」的图片才会返回，
 * 未登记的图片既不参与首页随机背景，也不会出现在图库页。
 */
const getRegisteredEntries = function (context) {
  const site = context.site || {};
  const rows = site.data && site.data.backgrounds;

  if (!Array.isArray(rows) || !rows.length) return [];

  const dir = path.join(hexo.source_dir, ...IMAGE_DIR);
  let available = null;

  try {
    available = new Set(fs.readdirSync(dir).filter((name) => IMAGE_PATTERN.test(name)));
  } catch (error) {
    return [];
  }

  // 按 file 去重，保留第一次出现的条目
  const byFile = new Map();
  rows.forEach((row) => {
    if (!row || !row.file) return;
    const file = String(row.file).trim();
    if (!file || byFile.has(file)) return;
    byFile.set(file, row);
  });

  return Array.from(byFile.entries())
    .filter(([file]) => available.has(file))
    .map(([file, row]) => ({
      file,
      url: context.url_for(`/images/backgrounds/${encodeURIComponent(file)}`),
      name: row.name ? String(row.name) : '',
      work: row.work ? String(row.work) : '',
      source: row.source ? String(row.source) : '',
      author: row.author ? String(row.author) : ''
    }));
};

// 图库页使用：返回已登记图片的完整信息
hexo.extend.helper.register('hsad_background_entries', function () {
  return getRegisteredEntries(this);
});

// 首页随机背景使用：只返回已登记图片的 URL
hexo.extend.helper.register('hsad_backgrounds', function () {
  return getRegisteredEntries(this).map((item) => item.url);
});
