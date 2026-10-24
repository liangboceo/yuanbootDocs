# yuanboot Python

简单、轻量、快速的 Python 微服务框架，基于 **FastAPI、Uvicorn 和依赖注入**构建，支持 Python 3.11+。
通过统一宿主管理 Web API、MVC、gRPC 和后台服务，为业务项目提供配置、数据访问、服务发现和可观测性。

[![Release](https://img.shields.io/github/v/tag/liangboceo/yuanboot-python?color=24B898&label=release&logo=github&sort=semver)](https://github.com/liangboceo/yuanboot-python/tags)
[![PyPI](https://img.shields.io/pypi/v/yuanboot?label=yuanboot)](https://pypi.org/project/yuanboot/)
[![CLI](https://img.shields.io/pypi/v/yuanbootctl-python?label=yuanbootctl-python)](https://pypi.org/project/yuanbootctl-python/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/downloads/)
[![License](https://img.shields.io/github/license/liangboceo/yuanboot-python)](https://github.com/liangboceo/yuanboot-python/blob/master/LICENSE)

[快速上手 →](quickstart.md) · [框架源码](https://github.com/liangboceo/yuanboot-python) · [版本与安装](versions.md)

## 框架特色

- FastAPI 路由、请求校验、OpenAPI、WebSocket 与 MVC 控制器。
- Singleton、Scoped、Transient 依赖注入，统一管理请求作用域和资源释放。
- Web、gRPC、Console 共用配置、生命周期和后台服务机制。
- YAML / JSON、多环境配置、环境变量、Nacos / Apollo 配置中心。
- MySQL、Redis、服务注册与发现、HTTP 客户端与任务调度。
- 结构化日志、Request ID、健康检查、Prometheus 和 JWT。
- 六类项目模板，支持创建、运行和构建业务项目。

## 框架架构

![yuanboot Python 框架架构：业务应用、服务宿主、配置与依赖注入、基础组件](/images/python-architecture.svg)

[查看完整架构图](/images/python-architecture.svg)

Web 使用 FastAPI / Uvicorn，gRPC 使用 grpc.aio，后台任务使用 Console Host。
各类宿主共用配置、依赖注入和生命周期，业务通过服务接口使用数据、缓存和服务治理组件。
构建与请求流程见[基本概念与架构](architecture.md)。

## 安装框架

在 Python 3.11+ 环境中安装已发布版本：

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install 'yuanboot[all]==0.1.6'
yuanbootctl-python --version
```

Windows 激活虚拟环境使用 `.venv\Scripts\Activate.ps1`。组件按需安装，见[版本与安装](versions.md)。
也可安装 `yuanbootctl-python==0.1.6` 自动获取同版本框架和项目命令；
无需 Python 的独立可执行文件见[CLI 工具](cli.md#独立可执行文件)。

## 简单示例

将下面代码保存为 `main.py`，执行 `python main.py`：

```python
from yuanboot.web import create_default_builder
from yuanboot.web.endpoints import use_actuator


def endpoints(router):
    use_actuator(router)

    @router.get("/info")
    def info():
        return {"info": "ok"}


host = create_default_builder(endpoints).build()
app = host.app

if __name__ == "__main__":
    host.run()
```

访问 `http://127.0.0.1:8080/info` 查看响应，访问 `http://127.0.0.1:8080/docs` 调试接口。

## 文档导航

| 开发阶段 | 文档 |
| --- | --- |
| 创建项目 | [快速上手](quickstart.md)、[CLI 工具](cli.md)、[版本与安装](versions.md) |
| 理解框架 | [基本概念与架构](architecture.md)、[代码展示](examples.md) |
| 配置服务 | [配置文件与多环境](configuration.md)、[组件配置与使用](components.md) |
| 开发接口 | [服务路由](web.md)、[MVC 控制器与视图](mvc.md)、[依赖注入](dependency-injection.md) |
| 后台与 RPC | [Console 与后台服务](hosting.md)、[gRPC 服务](grpc.md) |
| AI 辅助开发 | [AI 辅助编程指南](ai-assist.md)、[框架规格文档](spec.md) |
| 运行与部署 | [日志与可观测性](observability.md)、[Docker 部署](deployment/docker.md)、[宿主机部署](deployment/host.md) |
