# xiaokai.wang

Personal site & blog at [xiaokai-wang.github.io](https://xiaokai-wang.github.io/).

Built with [Jekyll](https://jekyllrb.com/) and hosted on [GitHub Pages](https://pages.github.com/).

## 主题

按内容分四个主题：

| 主题 | 路径 | 内容 |
|------|------|------|
| **生活** | `/life/` | 日常随笔、旅行见闻与生活里的细小时刻 |
| **照片** | `/photos/` | 相册式照片墙：把照片放进目录即自动展示 |
| **观点** | `/opinion/` | 对世界、行业与生活的独立思考 |
| **技术** | `/tech/` | 技术实践、开源项目与行业观察笔记 |

新文章放到 `_posts/<主题>/` 目录下，front matter 用 `category: <主题>` 即可。

## 照片相册（二级路径）

照片页是纯相册，**把图片文件直接放进目录即可展示，无需写文章**：

```
photos/
  index.md          ← 照片首页（自动列出所有相册）
  <相册名>/
    index.md        ← 相册页（front matter 见下）
    01.jpg
    02.jpg
    ...
```

- 相册页 `index.md` 内容：

  ```markdown
  ---
  layout: album
  title: 相册名
  album: 相册目录名
  description: 一句话描述（可选）
  ---
  ```

- 访问 `/photos/` 显示相册网格，点击进入二级路径 `/photos/<相册名>/` 查看该相册照片。
- 相册内图片按文件名排序（可用 `01_`、`02_` 前缀控制顺序），支持 jpg / jpeg / png / gif / webp / svg / bmp / avif。
- 点击照片可全屏查看大图，左右键/方向键切换，Esc 关闭。

## 本地预览

```bash
bundle install
bundle exec jekyll serve
```

访问 http://localhost:4000 查看。

## License

Content © xiaokai.wang. Code under MIT.
