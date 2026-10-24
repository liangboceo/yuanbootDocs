# 日志与可观测性


`use_actuator(router)` 提供以下运维端点：

| 路径 | 行为 |
| --- | --- |
| `/actuator/health/detail` | 健康检查，失败 HTTP 503 |
| `/actuator/health/readiness` | hosted services 完成启动后返回 up，异常/停机 HTTP 503 |
| `/actuator/health/liveness` | 进程存活 |
| `/actuator/prometheus` | 请求计数和耗时分布，按路由模板聚合 |
| `/docs`、`/openapi.json` | FastAPI 原生接口文档 |

独立 `use_health(router, {"database": check_db})` 支持自定义同步/异步检查和超时。
默认请求中间件生成/透传 `X-Request-ID`、记录访问耗时、回收请求作用域，并把未处理异常转换为不含异常堆栈的 JSON 500。日志使用标准 Python logging。
安装带 `jwt` 组件的框架依赖后，使用 `yuanboot.web.security.JwtBearer` 作为 FastAPI Security 依赖验证 JWT，详见[服务路由](web.md#jwt-鉴权)。




## 统一日志与启动信息

宿主默认启用日志，业务 `logging.getLogger(__name__)`、框架和服务器日志使用统一配置。
启动时输出 yuanboot-python 版本、`Copyright (c) 2026 jackson liang`、MIT 许可、应用名、PID 和运行环境。
文本日志默认 `log_type: zap`，可选 `logrus`；`json: true` 切换到结构化 JSON。

```yaml
yuanboot:
  logging:
    level: INFO
    log_type: zap
    json: false
    console: true
    file: ./logs/application.log
    max_bytes: 10485760
    backup_count: 5
    loggers:
      sqlalchemy.engine: WARNING
```

zap 文本格式（字段间为 Tab）：

```text
[yuanboot-nio-123-456] 2026/10/24 20:00:00.12 INFO orders/service.py:42 order created request_id=order-123
```

logrus 文本格式：

```text
2026/10/24 20:00:00.12 - [yuanboot-nio-123-456] - [INFO] order created level=INFO request_id=order-123
```

时间使用本地时区，保留百分秒；前缀包含 PID 和 Python 线程 ID。
访问日志记录状态、毫秒耗时、Host、方法、路径和 Request ID；请求正文不自动写入日志。
控制台与轮转文件使用相同格式，异常保留堆栈，额外字段中的密码和令牌会脱敏。
日志配置作用于当前进程，宿主关闭时释放处理器并恢复先前的日志配置。

## Swagger 版权信息

默认 `/docs` 与 `/openapi.json` 包含框架版本、版权、MIT 许可及框架链接。
业务可通过 `WebHostBuilder(title=..., version=..., description=..., contact=..., license_info=...)`
设置业务文档元数据；业务描述后附加独立的框架版权说明。
自定义 `docs_url`、代理路径和禁用文档的 FastAPI 选项继续生效。

## 请求追踪

默认请求管道会生成或透传 `X-Request-ID`，并将它写入响应头和访问日志。调用方可在请求中携带同一 ID，便于关联一次业务调用：

```bash
curl -i -H 'X-Request-ID: order-123' http://127.0.0.1:8080/info
```

Request ID 允许 1–128 位字母、数字、下划线、点、冒号和短横线，非法值会被替换。业务可通过 `HttpContext.request_id` 读取当前值；调用下游时需显式传递该请求头。它用于日志关联，完整的分布式链路采集需按项目接入相应工具。

## Prometheus 采集

在 Prometheus 配置中添加 Web 服务地址：

```yaml
scrape_configs:
  - job_name: orders
    metrics_path: /actuator/prometheus
    static_configs:
      - targets: ["orders:8080"]
```

将 `orders:8080` 替换为 Prometheus 能访问的服务地址。
请求计数和耗时按路由模板聚合；新增接口后可在指标端点查看实际序列。

## 部署后的检查

```bash
curl -f http://127.0.0.1:8080/actuator/health/readiness
curl -f http://127.0.0.1:8080/actuator/health/detail
```

readiness 用于确认宿主就绪，detail 用于查看已注册组件的健康状态。
反向代理、容器或负载均衡器可使用 readiness 决定是否向实例转发请求。
