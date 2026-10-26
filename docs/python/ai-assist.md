# AI 辅助编程指南

yuanboot Python 使用类型标注、构造器注入、Pydantic 模型和统一的项目模板，让 AI 助手能够沿着路由、业务服务和配置理解应用。开发时先提供项目上下文，再按接口契约逐步实现功能。

## 核心优势

| 设计方式 | 在项目中的作用 | 给 AI 的上下文 |
| --- | --- | --- |
| 类型标注与构造器注入 | 明确服务依赖和生命周期 | 服务如何创建、依赖哪些对象 |
| Pydantic 请求与响应模型 | 校验输入并生成 OpenAPI | 字段、约束和返回结构 |
| 声明式路由 | 显式定义路径、方法和分组 | 接口边界和鉴权位置 |
| YAML 多环境配置 | 分离代码和运行参数 | 配置键、环境差异和连接信息 |
| CLI 项目模板 | 统一入口、Startup 和业务模块 | 新功能应该放在哪里 |

## 声明式依赖注入

通过构造器的类型标注声明依赖，在 `Startup.configure_services` 中注册业务服务：

```python
from yuanboot import Configuration


class UserService:
    def __init__(self, configuration: Configuration):
        self.configuration = configuration

    def greeting(self, name: str) -> str:
        prefix = self.configuration.get_string("greeting.prefix", "Hello")
        return f"{prefix}, {name}!"


class Startup:
    def configure_services(self, services):
        services.add_scoped(UserService)
```

AI 可以据此追踪控制器到业务服务的依赖链。生成代码时应明确选用 `add_singleton`、`add_scoped` 或 `add_transient`；请求服务通常使用 Scoped，单例不能依赖请求作用域对象。完整规则见[依赖注入](dependency-injection.md)。

## 声明式路由与 API 定义

下面的控制器复用上面的 `UserService`，可放在业务包的 `controllers.py` 中：

```python
from pydantic import BaseModel, Field
from yuanboot.web import ApiController, ApiResult, controller, route


class GreetingRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100, description="用户名称")


@controller("/api/users", tags=["Users"])
class UserController(ApiController):
    def __init__(self, service: UserService):
        self.service = service

    @route("/greet", methods=["POST"], summary="生成问候语")
    def greet(self, body: GreetingRequest) -> ApiResult[str]:
        return self.ok(self.service.greeting(body.name))
```

在同一个 `Startup` 中加入：

```python
def configure(self, app):
    app.use_mvc(lambda mvc: mvc.add_controller(UserController))
```

请求体由 FastAPI 绑定，Pydantic 校验失败时返回 HTTP 422。`Field` 约束、类型和路由说明会出现在 `/docs` 与 `/openapi.json` 中，AI 可据此实现调用端与测试。Endpoint 写法见[服务路由](web.md)，视图和完整注册示例见[MVC 控制器](mvc.md)。

## 声明式中间件与配置

将跨域、静态资源、路由等应用配置集中在 `Startup.configure` 中；JWT 使用 `JwtBearer` 和 FastAPI `Security` 依赖。让 AI 修改现有配置入口，并说明需要保护的具体路由，见[JWT 鉴权](web.md#jwt-鉴权)。

业务配置使用 YAML，敏感信息通过环境变量提供：

```yaml
greeting:
  prefix: "Hello"
yuanboot:
  application:
    name: userservice
    server:
      address: ":8080"
  datasource:
    redis:
      url: "${REDIS_URL:redis://127.0.0.1:6379}"
```

让 AI 按[配置文件与多环境](configuration.md)中的键和优先级生成配置，并按需使用 `use_components()` 启用组件。同步数据库、Redis 和 SMTP 调用放在普通 `def` 动作中，异步动作使用线程池，避免阻塞事件循环。

## AI 提示词模板

### 创建 Controller 与 Service

```text
请先阅读 pyproject.toml、现有 startup.py、controllers.py 和业务模型，
按 yuanboot Python 的 MVC 模式添加用户创建和查询接口：
- 使用 @controller / @route 和 Pydantic 请求模型；
- UserService 通过构造器注入，并在 configure_services 中注册为 Scoped；
- 按项目现有 ApiResult 格式响应，明确不存在和重复创建时的状态码；
- 保留已有路由与字段命名，添加输入校验及接口测试。
框架用法参考 Python 文档的 MVC、依赖注入和框架规格文档。
```

### 添加 JWT 鉴权

```text
请基于现有 yuanboot Python 路由，为 /api/users 添加 JWT 鉴权：
使用 yuanboot.web.security.JwtBearer 和 fastapi.Security，
密钥从 JWT_SECRET 读取；登录与健康检查保持公开，
测试有效令牌、缺失令牌、签名错误和过期令牌。
先检查项目是否安装 jwt 依赖，再修改现有配置入口。
```

### 配置服务发现

```text
请按 yuanboot Python 的服务发现文档接入 Nacos：
连接信息放在 yuanboot.cloud.nacos，注册配置放在 yuanboot.cloud.discovery；
使用 use_components()，保留 dev/fat/uat/pro 的配置布局，
区分注册地址和服务实际监听端口，凭据通过环境变量传入。
需要调用 inventory 服务时，使用 HttpClientFactory 的 lb://inventory 地址。
```

### 创建 gRPC 服务

```text
请阅读当前 yuanboot Python gRPC 模板，添加用户查询 RPC：
先确定 proto 请求和响应契约，再生成 Python stub，
通过 GrpcHostBuilder.configure_server 注册 grpc.aio servicer，
保留现有依赖注入与生命周期管理，并提供客户端调用示例。
配置键和注册方式以 Python 框架的 gRPC 文档为准。
```

## 代码生成最佳实践

### 使用 CLI 创建项目骨架

先完成[框架安装](versions.md)，再执行：

```bash
yuanbootctl-python new mvc -n userservice --framework-version 0.2.0
cd userservice
python -m pip install -e '.[dev]'
yuanbootctl-python run --profile dev --reload
```

Web API 可选 `webapi`，后台任务可选 `console`，RPC 服务可选 `grpc`。命令和参数见[CLI 工具](cli.md)。

### 沿用模板结构

MVC 项目主要文件：

```text
userservice/
├── pyproject.toml
├── config.yml
├── config_dev.yml
├── config_fat.yml
├── config_uat.yml
├── config_pro.yml
└── userservice/
    ├── main.py
    ├── startup.py
    ├── controllers.py
    └── templates/
```

业务增长后可在业务包中拆出 `services/`、`models/` 等模块。让 AI 先确认当前模板的真实结构，再新增文件。

## AI 辅助开发工作流

1. **准备上下文**：提供需求、依赖版本、现有入口和[框架规格文档](spec.md)，明确需要修改的模块。
2. **确定接口契约**：先确认路径、请求字段、响应结构、权限和错误状态，再生成实现。
3. **实现业务**：沿用现有控制器与服务分层，显式注册依赖，补齐必要配置。
4. **运行与验证**：启动应用，在 `/docs` 调用接口，用 TestClient 检查正常请求、校验失败和鉴权失败。
5. **交付应用**：按项目需要补充[日志与健康检查](observability.md)、[Docker 部署](deployment/docker.md)或[宿主机部署](deployment/host.md)。

## 相关文档

- [CLI 工具](cli.md)
- [框架规格文档](spec.md)
- [MVC 控制器与视图](mvc.md)
- [服务注册与发现](service-discovery.md)
- [邮件服务](email.md)
- [Python 框架源码](https://github.com/liangboceo/yuanboot-python)
