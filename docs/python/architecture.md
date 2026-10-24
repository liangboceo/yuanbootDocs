# 基本概念与架构

![yuanboot Python 框架分层与宿主关系](/images/python-architecture.svg)

[查看完整架构图](/images/python-architecture.svg)

## HostBuilder

宿主构建器负责组装配置、服务容器和应用生命周期。按应用类型选择：

| 构建器 | 运行方式 | 适用场景 |
| --- | --- | --- |
| `WebHostBuilder` | FastAPI + Uvicorn | HTTP API、MVC、WebSocket |
| `GrpcHostBuilder` | grpc.aio | RPC 服务 |
| `HostBuilder` | Console 事件循环 | 后台任务、独立 Worker |

常用方法：

| 方法 | 作用 |
| --- | --- |
| `use_configuration` | 提供配置对象 |
| `configure_services` | 注册业务服务和依赖 |
| `use_components` | 按配置启用基础组件 |
| `use_startup` | 从 Startup 组织注册与应用配置 |
| `on_application_life_event` | 订阅启动和停止事件 |
| `build` | 创建可运行宿主 |

## ApplicationBuilder 与 RouterBuilder

Web 的 `ApplicationBuilder` 用于配置中间件、路由、MVC、静态文件和模板。
`use_endpoints` 接收 `RouterBuilder`，通过 `get / post` 等方法声明接口，
通过 `group` 组织 URL 前缀。

```python
from yuanboot.web import WebHostBuilder


def endpoints(router):
    @router.get("/info")
    def info():
        return {"info": "ok"}


host = (
    WebHostBuilder()
    .configure(lambda app: app.use_endpoints(endpoints))
    .build()
)
```

## Host 与生命周期

`build()` 返回宿主；Web 宿主通过 `host.app` 暴露 ASGI 应用，通过 `host.run()` 启动 Uvicorn。
Console 和 gRPC 通过各自的 `host.run()` 进入运行循环。

构建和运行顺序：

```text
读取基础配置与环境配置
  → 注册组件、业务服务与后台服务
  → 配置路由或 RPC 处理器
  → build() 创建宿主
  → 启动托管服务并进入就绪状态
  → 处理请求 / 执行后台任务
  → 接收停止信号，逆序停止服务并释放资源
```

HTTP 请求处理过程：

```text
客户端 → Uvicorn → 请求中间件 / 请求作用域
       → FastAPI 路由或 MVC 控制器 → 业务服务 → 数据库 / 缓存 / 远程服务
       → 响应 → 释放请求作用域
```

`Singleton` 在宿主内共享，`Scoped` 在一次请求内共享，`Transient` 每次解析创建。
更多用法见[依赖注入](dependency-injection.md)。

## 项目入口

CLI 从当前项目的 `pyproject.toml` 读取运行入口。
Web 项目示例：

```toml
[tool.yuanboot]
kind = "web"
app = "orders.main:app"
module = "orders.main"
```

Console 和 gRPC 模板使用 `kind = "console"`，通过 `module` 执行业务模块。
配置文件从项目工作目录加载；部署时需同时提供业务包、`pyproject.toml` 和环境配置。

## Startup

项目变大后，可将服务注册和应用配置集中到 Startup：

```python
class Startup:
    def configure_services(self, services):
        # 注册业务服务
        pass

    def configure(self, app):
        app.use_endpoints(endpoints)


host = WebHostBuilder().use_startup(Startup()).build()
```

路由定义见[服务路由](web.md)，控制器和视图见 [MVC](mvc.md)，
后台任务见 [Console 与后台服务](hosting.md)。
