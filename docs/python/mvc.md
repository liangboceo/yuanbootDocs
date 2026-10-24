# MVC 控制器与视图

## 创建 MVC 项目

```bash
yuanbootctl-python new mvc -n portal --framework-version 0.1.8
cd portal
python -m pip install -e '.[dev]'
yuanbootctl-python run --reload
```

访问 `http://127.0.0.1:8080/` 查看 Jinja2 页面，访问 `/docs` 调试控制器接口。

## 控制器与业务服务

在 `portal/controllers.py` 中声明服务和控制器：

```python
from pydantic import BaseModel, Field
from yuanboot.web import ApiController, ApiResult, controller, route


class GreetingRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class GreetingService:
    def greet(self, name: str) -> str:
        return f"Hello, {name}!"


@controller("/api", tags=["Greeting"])
class GreetingController(ApiController):
    def __init__(self, service: GreetingService):
        self.service = service

    @route("/greet", methods=["POST"])
    def greet(self, body: GreetingRequest) -> ApiResult[str]:
        return self.ok(self.service.greet(body.name))
```

控制器默认按请求创建，构造函数中的服务通过依赖注入解析。
动作参数由 FastAPI 绑定和校验；支持同步、异步方法及 FastAPI Depends。

在 `portal/startup.py` 中注册：

```python
from .controllers import GreetingController, GreetingService


class Startup:
    def configure_services(self, services):
        services.add_scoped(GreetingService)

    def configure(self, app):
        app.use_mvc(lambda mvc: mvc.add_controller(GreetingController))
```

`route` 支持传递 FastAPI 路由参数，例如 `status_code / response_model / dependencies`。
`self.ok(value)` 返回统一的 `ApiResult` 响应。

## 渲染视图

Startup 中通过 `app.use_views(directory)` 注册模板服务。
可使用相对于模块的绝对路径，避免部署时工作目录变化影响模板定位：

```python
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# 在 Startup.configure 中调用：
# app.use_views(ROOT / "templates")
```

页面控制器通过依赖注入获取 `Jinja2Templates`：

```python
from fastapi import Request
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates
from yuanboot.web import controller, route


@controller(tags=["Pages"])
class HomeController:
    def __init__(self, templates: Jinja2Templates):
        self.templates = templates

    @route("/", response_class=HTMLResponse)
    def index(self, request: Request):
        return self.templates.TemplateResponse(
            request=request,
            name="index.html",
            context={"title": "portal"},
        )
```

将 `HomeController` 一并加入 `app.use_mvc`，并在 `portal/templates/index.html` 中编写页面。
模板打包时应随业务包一起发布。
