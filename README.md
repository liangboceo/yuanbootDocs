# yuanboot Docs

## Compile
```bash
git clone https://github.com/liangboceo/docs.git
npm install

npm install -D vuepress

npm run docs:dev
```

## 框架语言

- `/` 和现有文档地址默认展示 Golang。
- 顶部语言菜单选择 Python 后进入 `/python/`，侧栏展开 Python 框架文档。
- 文档导航、源码和 GitHub 地址按当前 URL 切换，刷新或分享 Python 文档链接后仍展示 Python。
- Python 内容位于 `docs/python/`；语言导航和侧栏配置位于 `docs/.vuepress/config.js`。
- `FrameworkNavLinks.vue` 继承主题导航，通过 Webpack alias 同时用于顶部和移动端侧栏，保留现有主题样式。
