# CLI 工具

Python CLI 用于创建、运行和构建业务项目。完成[框架安装](versions.md)后即可使用：

```bash
python -m yuanboot.cli --help
python -m yuanboot.cli version
```

`python -m yuanboot.cli` 始终使用当前 Python 环境中的框架。
`v0.1.2` 安装的快捷命令为 `yuanbootctl`；使用提供 `yuanbootctl-python` 的工具版本时，可用它代替模块命令。
Go 工具继续使用 Go 环境中的 `yuanbootctl`。

## 命令概览

| 命令 | 说明 |
| --- | --- |
| `new` | 从模板创建项目 |
| `run` | 启动项目中的 Web、gRPC 或 Console 宿主 |
| `build` | 构建业务项目的 wheel 和源码包 |
| `version` | 查看当前框架版本 |

## new — 创建项目

```bash
python -m yuanboot.cli new <模板> -n <项目名> -p <输出目录>
```

| 参数 | 说明 |
| --- | --- |
| `--list`、`-l` | 列出可用模板 |
| `--name`、`-n` | 项目名称，默认 `demo` |
| `--path`、`-p` | 输出目录，默认当前目录 |
| `--framework-ref` | 生成项目使用的框架 tag，默认与工具版本一致 |
| `--framework-repo` | 框架 Git 仓库，默认 Python 框架仓库 |

| 模板 | 用途 |
| --- | --- |
| `simpleweb` | 最小 HTTP 服务 |
| `webapi` | REST API、服务注入和参数校验 |
| `mvc` | 控制器、业务服务和 Jinja2 视图 |
| `microservice` | Web API 与后台任务 |
| `console` | Console 宿主与后台服务 |
| `grpc` | gRPC 服务与健康检查 |

```bash
python -m yuanboot.cli new --list
python -m yuanboot.cli new webapi -n orders --framework-ref v0.1.2
python -m yuanboot.cli new mvc -n portal --framework-ref v0.1.2
python -m yuanboot.cli new grpc -n inventory --framework-ref v0.1.2
```

项目名以字母开头，可包含字母、数字、短横线和下划线。输出目录下已有同名项目时不会覆盖。

## run — 运行项目

在生成的项目目录执行：

```bash
python -m yuanboot.cli run
python -m yuanboot.cli run --profile dev --reload
python -m yuanboot.cli run --profile fat --port 9000
python -m yuanboot.cli run --profile pro --workers 2
```

| 参数 | 说明 |
| --- | --- |
| `--path`、`-p` | 项目目录，需包含 `pyproject.toml` |
| `--profile` | `dev / fat / uat / pro` |
| `--host`、`--port` | Web 监听地址与端口 |
| `--reload` | Web 开发热重载 |
| `--workers` | Web 工作进程数，默认 1 |

`--reload` 与多 worker 不能同时使用；Console 和 gRPC 项目不使用这些 Web 参数。
入口由 `pyproject.toml` 的 `[tool.yuanboot]` 配置决定，见[基本概念与架构](architecture.md#项目入口)。
每个 worker 会运行自己的后台服务，定时任务需要跨进程唯一执行时，应使用锁或独立调度服务。

## build — 构建业务项目

在业务环境中安装构建依赖：

```bash
python -m pip install build
python -m yuanboot.cli build
```

默认在 `dist/` 中生成 wheel 和源码包：

```text
dist/
├── orders-0.1.0-py3-none-any.whl
└── orders-0.1.0.tar.gz
```

构建版本取自业务项目 `pyproject.toml` 的 `project.version`。
它与依赖的 yuanboot 框架版本分别管理。

```bash
python -m yuanboot.cli build --wheel
python -m yuanboot.cli build --sdist
python -m yuanboot.cli build --outdir ./packages
```

构建后按 [Docker 部署](deployment/docker.md)或[宿主机部署](deployment/host.md)运行服务。

## version — 查看版本

```bash
python -m yuanboot.cli version
python -m yuanboot.cli --version
```

框架版本的选择和升级见[版本与安装](versions.md)。
