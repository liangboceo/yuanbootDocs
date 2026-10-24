# 版本、安装与发布

[![Release](https://img.shields.io/github/v/tag/liangboceo/yuanboot-python?color=24B898&label=release&logo=github&sort=semver)](https://github.com/liangboceo/yuanboot-python/releases)
[![PyPI](https://img.shields.io/pypi/v/yuanboot?label=yuanboot)](https://pypi.org/project/yuanboot/)
[![CLI](https://img.shields.io/pypi/v/yuanbootctl-python?label=yuanbootctl-python)](https://pypi.org/project/yuanbootctl-python/)

框架提供公开 PyPI 包、Git tag 依赖和独立命令行可执行文件，Python 包需要 Python 3.11+。

## 从公开 PyPI 安装

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install 'yuanboot[all]==0.1.8'
yuanbootctl-python --version
```

也可通过工具安装包获取同版本框架：

```bash
python -m pip install yuanbootctl-python==0.1.8
# 工具与全部标准组件：
python -m pip install 'yuanbootctl-python[all]==0.1.8'
```

| PyPI 包 | 内容 |
| --- | --- |
| [yuanboot](https://pypi.org/project/yuanboot/) | 框架、组件、CLI 命令入口和项目模板 |
| [yuanbootctl-python](https://pypi.org/project/yuanbootctl-python/) | 工具安装包，精确依赖同版本的 yuanboot |

安装公开包无需 PyPI 账号。Windows 激活环境使用 `.venv\Scripts\Activate.ps1`。
无需 Python 的版本可从 [GitHub Releases](https://github.com/liangboceo/yuanboot-python/releases) 下载，见 [CLI 工具](cli.md#独立可执行文件)。

## 按需安装组件

```bash
python -m pip install 'yuanboot[mysql,redis,nacos]==0.1.8'
python -m pip install 'yuanboot[all]==0.1.8'
```

可选组件包括 `mysql / redis / nacos / apollo / discovery / http / jwt / scheduler / grpc / xxljob`。
配置和用法见[组件配置与使用](components.md)。

## 使用 Git tag 安装

需要本机安装 Git：

```bash
python -m pip install 'yuanboot[all] @ git+https://github.com/liangboceo/yuanboot-python.git@v0.1.8'
```

Git tag 保持不可变，业务项目仍可按此方式管理框架依赖。

## 在业务项目中固定版本

模板默认在 `pyproject.toml` 中使用公开 PyPI 的精确版本，读取工具内置的框架版本。
升级工具后新生成项目使用新版本，已有业务项目保留原版本。创建时也可显式指定：

```bash
yuanbootctl-python new webapi -n orders --framework-version 0.1.8
```

```toml
[project]
name = "orders"
version = "0.1.0"
dependencies = [
  "yuanboot==0.1.8",
]

[project.optional-dependencies]
components = [
  "yuanboot[all]==0.1.8",
]
```

gRPC 项目的基础依赖使用 `yuanboot[grpc]==0.1.8`。
显式指定 `--framework-ref v0.1.8` 或 `--framework-repo` 可切换为 Git 依赖，安装时需要 Git。
PyPI 的 `--framework-version` 与这两个 Git 选项不能混用。
业务项目版本与框架版本分别维护，同一个业务项目中的框架依赖应保持一致。

## 升级框架

先在 PyPI 或 GitHub Release 确认目标版本已公开，更新项目中的框架依赖，再安装、验证并部署：

```bash
python -m pip install --upgrade -e '.[dev,components]'
```

使用 uv 时更新并提交业务锁文件：

```bash
uv lock --upgrade-package yuanboot
uv sync --frozen --extra components
```

固定框架版本后，还需要锁文件固定 FastAPI、SQLAlchemy 等传递依赖。

## GitHub Release 自动同步 PyPI

维护者通过 GitHub **Actions → Build Release → Run workflow** 发布：

1. 选择 `master`，填写 `version`，例如 `0.1.8`，不带 `v`。
2. 正式发布选择 `draft=false`；按需要选择是否为 prerelease。
3. 工作流检查 Python 3.11–3.14，构建两个包及五个平台的独立可执行文件。
4. 全部通过后创建不可变的 `v<version>` tag，上传 GitHub Release 和 `SHA256SUMS`。
5. 公开 Release 创建后自动启动 **Publish PyPI**，校验安装包并上传两个同版本包。

草稿 Release 在公开发布时同步 PyPI。仅推送裸 Git tag 不含安装包，不会直接上传。
上传失败时可手动运行 **Publish PyPI** 并填写同一版本，已存在文件会跳过。

PyPI 使用 GitHub Trusted Publisher，无需在仓库保存 PyPI 密码或长期 Token。
两个包绑定相同仓库和 `PublishPyPI.yml`，GitHub Environment 分别为 `pypi`、`pypi-cli`。
完整维护说明见[框架发布文档](https://github.com/liangboceo/yuanboot-python/blob/master/docs/releases.md)。
