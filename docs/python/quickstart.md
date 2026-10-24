# 快速上手

## 环境准备

安装 Python 3.11+ 和 Git。在新目录创建虚拟环境：

```bash
mkdir yuanboot-workspace
cd yuanboot-workspace
python -m venv .venv
source .venv/bin/activate
python -m pip install 'yuanboot @ git+https://github.com/liangboceo/yuanboot-python.git@v0.1.2'
```

Windows PowerShell 使用 `.venv\Scripts\Activate.ps1` 激活环境。
下文统一使用 `python -m yuanboot.cli` 调用 Python 工具，不依赖命令是否已加入 PATH，也避免与 Go 的 `yuanbootctl` 混用。

## 创建项目

```bash
python -m yuanboot.cli new webapi -n orders --framework-ref v0.1.2
cd orders
python -m pip install -e '.[dev]'
python -m yuanboot.cli run --profile dev --reload
```

访问：

- `http://127.0.0.1:8080/docs`：接口文档与在线调试。
- `http://127.0.0.1:8080/actuator/health/readiness`：就绪状态。
- `http://127.0.0.1:8080/actuator/prometheus`：监控指标。

`--reload` 用于本地开发，部署时关闭它。Ctrl+C 停止服务并释放宿主管理的资源。

## 项目结构

```text
orders/
├── orders/
│   ├── main.py          # 创建应用、读取配置
│   ├── startup.py       # 注册服务和路由
│   ├── endpoints.py     # API 接口
│   └── services.py      # 业务服务
├── config.yml           # 基础配置
├── config_dev.yml       # 开发环境
├── config_fat.yml       # 测试环境
├── config_uat.yml       # 验收环境
├── config_pro.yml       # 生产环境
├── pyproject.toml       # 业务版本、依赖和运行入口
├── Dockerfile
└── docker-compose.yml
```

`main.py` 负责组装宿主，`startup.py` 注册业务服务与接口，业务处理放在 `services.py`。
以 `mvc` 模板创建项目时，接口改为 `controllers.py`，并包含 `templates/` 视图目录。

## 修改配置与端口

修改 `config_dev.yml`：

```yaml
greeting:
  message: "Hello from orders"
```

指定环境和端口：

```bash
python -m yuanboot.cli run --profile fat --port 9000
```

配置支持 `dev / fat / uat / pro`，默认 `dev`。
详细覆盖规则见[配置文件与多环境](configuration.md)。

## 启用组件

```bash
python -m pip install -e '.[dev,components]'
```

模板的 `use_components()` 根据配置启用 MySQL、Redis、服务发现和日志等组件。
连接参数见[组件配置与使用](components.md)。

## 下一步

阅读[基本概念与架构](architecture.md)了解宿主、路由和依赖注入；
参考[代码展示](examples.md)编写业务接口；
上线时选择 [Docker 部署](deployment/docker.md)或[宿主机部署](deployment/host.md)。
