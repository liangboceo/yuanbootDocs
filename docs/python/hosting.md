# Console 与后台服务


`HostBuilder` 与 `WebHostBuilder` 共享配置、DI 和生命周期实现。`use_startup` 接收带 `configure_services` / `configure` 方法的对象或无参类。

```python
import asyncio
from yuanboot import BackgroundService, HostBuilder


class Worker(BackgroundService):
    async def execute(self):
        try:
            while True:
                await asyncio.sleep(5)
        finally:
            pass  # 释放任务内部资源


host = (
    HostBuilder()
    .configure_services(lambda services: services.add_hosted_service(Worker))
    .on_application_life_event(
        lambda life: life.subscribe("started", lambda event: print(event.topic))
    )
    .build()
)
# host.run()
```

事件按 `starting → started → stopping → stopped` 顺序触发，支持同步/异步处理器。HostedService 依次启动、逆序停止；启动失败回滚，单个清理失败仍继续清理其余服务。后台任务异常会记录日志并令 readiness 失败；正常停止取消并等待任务。
多 worker / 多副本会各自运行后台服务；跨实例的唯一执行、调度和分布式锁应由业务协调。


## 创建 Console 项目

```bash
yuanbootctl-python new console -n worker --framework-version 0.1.7
cd worker
python -m pip install -e '.[dev]'
yuanbootctl-python run --profile pro
```

Console 模板在 `worker/worker.py` 实现后台工作，在 `worker/main.py` 注册服务。
Console 不启动 HTTP 端口，不能使用 `--port / --host / --reload / --workers` 等 Web 参数。

Ctrl+C 或 SIGTERM 触发宿主停止，随后取消后台任务并释放资源。
长任务应在 `finally` 中清理自己持有的资源，不能吞掉取消信号后继续无限运行。

## 在 Web 服务中运行后台任务

`microservice` 模板已经包含 Web API 和后台 Worker：

```bash
yuanbootctl-python new microservice -n inventory --framework-version 0.1.7
```

也可以在现有 `WebHostBuilder` 的 `configure_services` 中调用 `add_hosted_service(Worker)`。
需要独立扩缩容或避免 Web 多 worker 重复执行时，将任务放入单独的 Console 服务。
