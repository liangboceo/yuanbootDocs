# 依赖注入


```python
from typing import Annotated
from yuanboot import Configuration, ServiceCollection
from yuanboot.web import WebHostBuilder, inject


class GreetingService:
    def __init__(self, config: Configuration):
        self.config = config


def services(collection: ServiceCollection):
    collection.add_scoped(GreetingService)


def endpoints(router):
    @router.get("/hello")
    def hello(service: Annotated[GreetingService, inject(GreetingService)]):
        return {"message": service.config.get_string("greeting.message", "hello")}


host = (
    WebHostBuilder()
    .configure_services(services)
    .configure(lambda app: app.use_endpoints(endpoints))
    .build()
)
```

- `add_singleton(Service[, Implementation])`：整个宿主共享。
- `add_scoped(Service[, Implementation])`：同一请求共享；WebSocket 以整个连接为作用域。
- `add_transient(Service[, Implementation])`：每次解析创建。
- `add_singleton(Service, instance=value)`：注册外部对象，其资源由调用方管理。
- 工厂函数通过参数类型标注注入；注册相同类型时以最后一次注册为准。

检测循环依赖，禁止在根容器或 singleton 依赖链中解析 scoped 服务。同步工厂构建实例，异步初始化放入 hosted service 的 `start`。容器创建的资源按创建逆序调用 `aclose` / `close`，请求作用域覆盖流式响应和 FastAPI 后台响应任务。独立任务应自行使用 `async with host.services.create_scope() as scope`，避免持有已经结束的请求作用域。

`HttpContext` 可通过 `Depends(get_context)` 注入，提供 query、param、bind、json、request_id、services。WebSocket 服务注入使用 `inject_websocket`。


## 选择生命周期

| 生命周期 | 适用对象 |
| --- | --- |
| Singleton | 配置、连接池、无请求状态的客户端 |
| Scoped | 请求内共享的业务服务、数据库 Session |
| Transient | 无共享状态的短期对象 |

控制器默认使用 Scoped。请求结束时释放请求作用域内的资源，宿主退出时释放宿主管理的单例资源。
需要数据库事务时，参考[MySQL、Redis 与请求作用域](components.md#mysql、redis-与请求作用域)。
