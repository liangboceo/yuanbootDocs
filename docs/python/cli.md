# CLI 工具

Python CLI 用于创建、运行和构建业务项目。完成[框架安装](versions.md)后即可使用：

```bash
yuanbootctl-python --help
yuanbootctl-python version
```

从公开 PyPI 安装：

```bash
python -m pip install yuanbootctl-python==0.1.9
```

工具安装包自动依赖同版本的 `yuanboot`，命令入口和模板资源由框架提供。
`yuanbootctl-python[all]` 可安装全部标准组件。
`python -m yuanboot.cli` 也可调用当前 Python 环境中的工具。

## 独立可执行文件

从 [GitHub Releases](https://github.com/liangboceo/yuanboot-python/releases) 下载对应平台的压缩包，
解压后即可执行，无需安装 Python。

| 平台 | 架构 |
| --- | --- |
| Linux | amd64 / arm64 |
| macOS | Intel / Apple Silicon |
| Windows | amd64 |

例如 Linux amd64：

```bash
VERSION=0.1.9
curl -fLO "https://github.com/liangboceo/yuanboot-python/releases/download/v${VERSION}/yuanbootctl-python_${VERSION}_linux_amd64.tar.gz"
tar -xzf "yuanbootctl-python_${VERSION}_linux_amd64.tar.gz"
./yuanbootctl-python new webapi -n orders
cd orders
../yuanbootctl-python run --profile dev
```

Windows 使用 `yuanbootctl-python.exe`。二进制内含 Python、框架、组件和模板文档资源。
增加额外业务依赖后，用 `run --python /path/to/.venv/bin/python` 指定业务环境。

## 命令概览

| 命令 | 说明 |
| --- | --- |
| `new` | 从模板创建项目 |
| `run` | 启动项目中的 Web、gRPC 或 Console 宿主 |
| `build` | 构建业务项目的 wheel 和源码包 |
| `version` | 查看当前框架版本 |

## new — 创建项目

```bash
yuanbootctl-python new <模板> -n <项目名> -p <输出目录>
```

| 参数 | 说明 |
| --- | --- |
| `--list`、`-l` | 列出可用模板 |
| `--name`、`-n` | 项目名称，默认 `demo` |
| `--path`、`-p` | 输出目录，默认当前目录 |
| `--framework-version` | PyPI 版本，默认读取工具内置的框架版本 |
| `--framework-ref` | 显式切换为 Git 依赖并指定 ref |
| `--framework-repo` | 显式切换为 Git 依赖并指定仓库 |

| 模板 | 用途 |
| --- | --- |
| `simpleweb` | 最小 HTTP 服务 |
| `webapi` | REST API、服务注入和参数校验 |
| `mvc` | 控制器、业务服务和 Jinja2 视图 |
| `microservice` | Web API 与后台任务 |
| `console` | Console 宿主与后台服务 |
| `grpc` | gRPC 服务与健康检查 |

```bash
yuanbootctl-python new --list
yuanbootctl-python new webapi -n orders --framework-version 0.1.9
yuanbootctl-python new mvc -n portal --framework-version 0.1.9
yuanbootctl-python new grpc -n inventory --framework-version 0.1.9
```

项目名以字母开头，可包含字母、数字、短横线和下划线。输出目录下已有同名项目时不会覆盖。
六种模板都默认生成 `README.md` 和 `spec`：

```text
README.md
spec/
├── yuanboot-python.md
├── components.md
└── backend-module-development.md
```

README 包含启动命令与文档入口，spec 包含框架说明、核心组件和后端模块开发规范。

## run — 运行项目

在生成的项目目录执行：

```bash
yuanbootctl-python run
yuanbootctl-python run --profile dev --reload
yuanbootctl-python run --profile fat --port 9000
yuanbootctl-python run --profile pro --workers 2
```

| 参数 | 说明 |
| --- | --- |
| `--path`、`-p` | 项目目录，需包含 `pyproject.toml` |
| `--profile` | `dev / fat / uat / pro` |
| `--host`、`--port` | Web 监听地址与端口 |
| `--reload` | Web 开发热重载 |
| `--workers` | Web 工作进程数，默认 1 |
| `--python` | 使用已安装业务依赖的 Python 解释器 |

`--reload` 与多 worker 不能同时使用；Console 和 gRPC 项目不使用这些 Web 参数。
入口由 `pyproject.toml` 的 `[tool.yuanboot]` 配置决定，见[基本概念与架构](architecture.md#项目入口)。
每个 worker 会运行自己的后台服务，定时任务需要跨进程唯一执行时，应使用锁或独立调度服务。

## build — 构建业务项目

在业务环境中安装构建依赖：

```bash
python -m pip install build
yuanbootctl-python build
```

默认在 `dist/` 中生成 wheel 和源码包：

```text
dist/
├── orders-0.1.0-py3-none-any.whl
└── orders-0.1.0.tar.gz
```

构建版本取自业务项目 `pyproject.toml` 的 `project.version`。
它与依赖的 yuanboot 框架版本分别管理。
独立二进制的 `build` 使用业务项目 `.venv` 的 Python，或通过 `--python` 指定；该环境必须安装 `build`。

```bash
yuanbootctl-python build --wheel
yuanbootctl-python build --sdist
yuanbootctl-python build --outdir ./packages
```

构建后按 [Docker 部署](deployment/docker.md)或[宿主机部署](deployment/host.md)运行服务。

## version — 查看版本

```bash
yuanbootctl-python version
yuanbootctl-python --version
```

框架版本的选择和升级见[版本与安装](versions.md)。
GitHub Release/tag 与 PyPI 的自动发布流程也见该页面。

0.1.8 起，六类模板均包含根目录 `main.py` 和 PyCharm 模块调试配置 `.run/yuanboot.run.xml`，详见[PyCharm 调试与直接运行](quickstart.md#pycharm-调试与直接运行)。
