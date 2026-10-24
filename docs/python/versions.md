# 版本与安装

[![Release](https://img.shields.io/github/v/tag/liangboceo/yuanboot-python?color=24B898&label=release&logo=github&sort=semver)](https://github.com/liangboceo/yuanboot-python/tags)

上方徽章展示 Python 仓库最新公开 tag。安装示例使用已公开的 `v0.1.2`；
可在[版本列表](https://github.com/liangboceo/yuanboot-python/tags)选择需要的版本。

## 安装指定版本

需要 Python 3.11+ 和 Git：

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install 'yuanboot @ git+https://github.com/liangboceo/yuanboot-python.git@v0.1.2'
python -m yuanboot.cli version
```

安装引用固定的 Git tag，使开发和部署使用同一框架版本。

## 按需安装组件

```bash
# MySQL、Redis 和 Nacos
python -m pip install 'yuanboot[mysql,redis,nacos] @ git+https://github.com/liangboceo/yuanboot-python.git@v0.1.2'

# 全部标准组件
python -m pip install 'yuanboot[all] @ git+https://github.com/liangboceo/yuanboot-python.git@v0.1.2'
```

可选组件包括 `mysql / redis / nacos / apollo / discovery / http / jwt / scheduler / grpc / xxljob`。
配置和用法见[组件配置与使用](components.md)。

## 在业务项目中固定版本

模板会把框架依赖写入 `pyproject.toml`。创建时可显式指定：

```bash
python -m yuanboot.cli new webapi -n orders --framework-ref v0.1.2
```

依赖示例：

```toml
[project]
name = "orders"
version = "0.1.0"
dependencies = [
  "yuanboot @ git+https://github.com/liangboceo/yuanboot-python.git@v0.1.2",
]
```

业务项目 `orders` 的 `0.1.0` 与框架的 `v0.1.2` 独立管理。
若项目还定义了 `components` 等可选依赖，其中的框架 tag 也应保持一致。

## 升级框架

先在[版本列表](https://github.com/liangboceo/yuanboot-python/tags)确认目标 tag 已公开，
将项目中所有 yuanboot 依赖改为该 tag，再安装、测试并部署业务项目：

```bash
python -m pip install --upgrade -e '.[dev,components]'
```

使用 uv 管理项目时，更新锁文件并提交到业务仓库：

```bash
uv lock --upgrade-package yuanboot
uv sync --frozen --extra components
```

固定 tag 只固定框架本身；锁文件用于同时固定 FastAPI、SQLAlchemy 等传递依赖。
