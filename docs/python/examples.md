# 代码展示

下面示例可保存为 `main.py` 并执行 `python main.py`，也可将服务和接口拆分到模板的对应模块。

## 路由、业务服务与依赖注入

```python
from typing import Annotated

from pydantic import BaseModel, Field
from yuanboot import Configuration, ConfigurationBuilder
from yuanboot.web import WebHostBuilder, inject
from yuanboot.web.endpoints import use_actuator


class GreetingRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class GreetingService:
    def __init__(self, configuration: Configuration):
        self.message = configuration.get_string("greeting.message", "Hello")

    def greet(self, name: str) -> str:
        return f"{self.message}, {name}!"


def endpoints(router):
    use_actuator(router)

    with router.group("/api", tags=["Greeting"]) as api:
        @api.post("/greet")
        def greet(body: GreetingRequest,
                  service: Annotated[GreetingService, inject(GreetingService)]):
            return {"message": service.greet(body.name)}


configuration = ConfigurationBuilder().add_yaml_file(optional=True).add_environment().build()
host = (
    WebHostBuilder(configuration)
    .configure_services(lambda services: services.add_scoped(GreetingService))
    .configure(lambda app: app.use_endpoints(endpoints))
    .build()
)
app = host.app

if __name__ == "__main__":
    host.run()
```

请求接口：

```bash
curl -X POST http://127.0.0.1:8080/api/greet \
  -H 'Content-Type: application/json' \
  -d '{"name":"yuanboot"}'
```

默认响应为 `{"message":"Hello, yuanboot!"}`。请求缺少 `name` 或长度不合法时返回 HTTP 422。
通过 `YUANBOOT_GREETING__MESSAGE=你好 python main.py` 覆盖问候语。

## 使用 MVC 模板

```bash
yuanbootctl-python new mvc -n portal --framework-version 0.2.0
cd portal
python -m pip install -e '.[dev]'
yuanbootctl-python run --reload
```

模板将上面的业务拆分为 `controllers.py` 中的控制器和服务，
由 `startup.py` 注册，并通过 `templates/index.html` 展示页面。
控制器的编写方法见 [MVC 控制器与视图](mvc.md)。
