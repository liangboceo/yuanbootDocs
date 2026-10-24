# 服务路由

Python Web Host 使用 FastAPI 接收请求，由 Uvicorn 提供 ASGI 服务。

## 声明接口与分组

```python
from pydantic import BaseModel
from yuanboot.web import create_default_builder
from yuanboot.web.endpoints import use_actuator


class OrderRequest(BaseModel):
    title: str


def endpoints(router):
    use_actuator(router)

    with router.group("/api", tags=["Orders"]) as api:
        @api.get("/orders/{order_id}")
        def detail(order_id: int, include_items: bool = False):
            return {"id": order_id, "include_items": include_items}

        @api.post("/orders", status_code=201)
        def create(body: OrderRequest):
            return {"title": body.title}


host = create_default_builder(endpoints).build()
app = host.app

if __name__ == "__main__":
    host.run()
```

`order_id` 从路径读取，`include_items` 从查询参数读取，`OrderRequest` 从 JSON 请求体读取。
类型与 Pydantic 模型决定校验规则和 OpenAPI 文档，无效输入默认返回 HTTP 422。
`get / post / put / patch / delete` 等声明方式与 FastAPI 一致。

同步数据库或 Redis 调用放在普通 `def` 路由中；异步 I/O 路由可使用 `async def`。
完整的服务注入示例见[代码展示](examples.md)。

## CORS 与中间件

在 `Startup.configure` 中配置：

```python
def configure(self, app):
    app.use_cors(
        allow_origins=["https://orders.example.com"],
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
    )
    app.use_endpoints(endpoints)
```

自定义中间件通过 `app.use_middleware(MiddlewareClass, **options)` 注册，
也可通过 `app.app` 使用原生 FastAPI API。

## 静态文件与视图

```python
def configure(self, app):
    app.use_static("/static", directory="static")
    app.use_views(directory="templates")
```

目录相对项目的运行目录，部署时需要一并提供。
视图通过 Jinja2 渲染，控制器示例见 [MVC 控制器与视图](mvc.md)。

## JWT 鉴权

先安装包含 `jwt` 的框架依赖，如 `yuanboot[all]`，再注册 Security 依赖：

```python
import os
from typing import Annotated
from fastapi import Security
from yuanboot.web.security import JwtBearer

bearer = JwtBearer(os.environ["JWT_SECRET"], algorithms=["HS256"])


def endpoints(router):
    @router.get("/me")
    def me(claims: Annotated[dict, Security(bearer)]):
        return {"subject": claims.get("sub")}
```

令牌必须有有效签名和 `exp` 过期字段；缺失、过期或签名错误时返回 HTTP 401。
`JWT_SECRET` 从部署环境提供。issuer 和 audience 可在 `JwtBearer` 构造时指定。
