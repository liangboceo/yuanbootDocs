# 框架规格文档

本文汇总 yuanboot Python 应用开发的入口、API 和约定，可作为 AI 编程助手的框架上下文。项目的实际依赖版本、已有代码和业务接口契约应一并提供给助手。

## 运行环境与入口

- Python 3.11+，Web 基于 FastAPI / Uvicorn，gRPC 基于 grpc.aio。
- 业务依赖在 `pyproject.toml` 中声明，入口由 `[tool.yuanboot]` 指定。
- CLI 使用 `yuanbootctl-python`，支持 `new / run / build / version`。
- 模板包括 `simpleweb / webapi / mvc / microservice / console / grpc`。
- 创建业务项目默认固定到工具内置框架版本，可用 `--framework-version 0.1.7` 指定其他 PyPI 版本。
- 所有模板默认提供 README 和 `spec/yuanboot-python.md`、`spec/components.md`、`spec/backend-module-development.md`，可作为离线开发文档。
- 公开 PyPI 提供 `yuanboot` 和 `yuanbootctl-python`，两者保持同一版本；也可使用 Git tag 依赖。

详见[快速上手](quickstart.md)、[项目入口](architecture.md#项目入口)与[CLI 工具](cli.md)。

## 宿主与应用配置

| 场景 | API | 用途 |
| --- | --- | --- |
| 最小 Web | `yuanboot.web.create_default_builder(endpoints)` | 快速定义 HTTP 接口 |
| Web 应用 | `yuanboot.web.WebHostBuilder` | 配置依赖、Startup 和 Web 管道 |
| 后台任务 | `yuanboot.HostBuilder` | 管理后台服务与应用生命周期 |
| gRPC | `yuanboot.grpc.GrpcHostBuilder` | 注册异步 gRPC 服务 |

常用构建顺序为配置来源 → `use_components()` → `use_startup(Startup())` → `build()`。
Startup 通过 `configure_services(services)` 注册业务依赖，通过 `configure(app)` 配置 Web 应用。
Web 应用公开 `host.app` 供 ASGI 服务或 TestClient 使用，直接运行使用 `host.run()`。

## 依赖注入

从 `yuanboot` 导入 `ServiceCollection` 和 `Configuration`。服务构造函数及工厂参数使用类型标注：

| 注册方式 | 生命周期 |
| --- | --- |
| `services.add_singleton(Service)` | 整个宿主共享 |
| `services.add_scoped(Service)` | 当前请求或显式作用域共享 |
| `services.add_transient(Service)` | 每次解析创建 |
| `services.add_singleton(Service, instance=value)` | 使用调用方提供的对象 |

Endpoint 使用 `Annotated[Service, inject(Service)]`，`inject` 从 `yuanboot.web` 导入。
MVC 控制器使用构造器注入，默认按 Scoped 创建。Singleton 不能依赖 Scoped。
独立后台任务通过 `host.services.create_scope()` 创建并释放自己的作用域。
异步初始化放入 hosted service 的 `start`，不要放在同步构造函数中。详见[依赖注入](dependency-injection.md)。

## 路由、模型与响应

- Endpoint：`@router.get("/users/{user_id}")`、`@router.post(...)`；`router.group("/api", tags=[...])` 定义分组。
- MVC：从 `yuanboot.web` 导入 `controller / route / ApiController / ApiResult`，以 `@controller("/api")` 和 `@route("/users", methods=["POST"])` 声明接口。
- MVC 挂载：`app.use_mvc(lambda mvc: mvc.add_controller(UserController))`。
- 请求模型使用 Pydantic `BaseModel`、`Field`；路径和查询参数使用 Python 类型标注。
- `ApiController.ok(data)` 返回 `ApiResult`；已有项目的统一响应格式应保持一致。
- FastAPI 默认校验错误为 HTTP 422，OpenAPI 在 `/openapi.json`，交互文档在 `/docs`。
- 普通 `def` 动作适合调用同步数据库、Redis 和 SMTP；异步动作应使用异步客户端或线程池。

详见[服务路由](web.md)与[MVC 控制器与视图](mvc.md)。

## 中间件与鉴权

应用通过 `app.use_cors(...)`、`app.use_static(...)`、`app.use_views(...)` 和 `app.use_middleware(...)` 配置 Web 能力。
JWT 使用 `yuanboot.web.security.JwtBearer` 配合 FastAPI `Security`，密钥来自环境或配置。
默认请求管道管理 Request ID、访问日志、异常处理和请求作用域。业务日志使用标准 `logging`。

## 配置约定

| 配置路径 | 用途 |
| --- | --- |
| `yuanboot.application.name` | 应用名 |
| `yuanboot.application.server.address` | Web 监听地址，例如 `:8080` |
| `yuanboot.grpc.address` | gRPC 监听地址 |
| `yuanboot.logging` | 日志 |
| `yuanboot.datasource.mysql` / `redis` | 数据库与缓存 |
| `yuanboot.cloud.nacos` | Nacos 连接与配置中心 |
| `yuanboot.cloud.discovery` | 注册中心类型与实例信息 |
| `yuanboot.email` | SMTP 连接 |

配置文件为 `config.yml` 和 `config_<profile>.yml`，环境使用 `dev / fat / uat / pro`。
优先级：默认值 < 基础文件 < 环境文件 < 远程源 < 环境变量 < CLI。
通过 `Configuration.get_string/get_int/get_bool/get_section` 读取，`bind(Model, "section")` 绑定模型。
环境插值使用 `${ENV:default}`，嵌套覆盖使用双下划线，如 `YUANBOOT_DATABASE__URL` 对应 `database.url`。
远程配置在构建宿主前加入 `ConfigurationBuilder`；连接池、监听端口等已创建资源的配置变更需要重启。

详见[配置文件与多环境](configuration.md)及[组件配置与使用](components.md)。

## 组件与可观测性

`use_components()` 按已合并配置注册组件，也可按需调用 `use_mysql()`、`use_redis()`、`use_service_discovery()`、`use_email()` 等。
额外依赖按实际使用安装，不能只新增配置而忽略依赖。
`use_actuator(router)` 从 `yuanboot.web.endpoints` 导入，提供健康、就绪和 Prometheus 端点。
HTTP 服务发现调用使用 `HttpClientFactory.create("lb://服务名")`，从 DI 获取工厂。

## 生成业务代码时的约定

1. 先阅读项目 `pyproject.toml`、Startup、路由、模型和配置，再确定新增文件位置。
2. 保持实际 Python API 与依赖版本一致，使用本页链接核对模块和参数。
3. 请求和响应模型、权限、状态码应先确定，再实现控制器和服务。
4. 配置中的凭据使用环境变量；连接池交给宿主管理，事务在业务边界内处理。
5. 测试使用现有项目的测试工具；Web 接口可通过 FastAPI TestClient 验证。

实践示例见[AI 辅助编程指南](ai-assist.md)。
