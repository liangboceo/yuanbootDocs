# Docker 部署

下面以 `webapi` 模板生成的 `orders` 为例，将 Python 业务项目与运行环境一起打包。
框架版本固定在项目的 `pyproject.toml` 中，部署环境使用 `pro`。

## 准备项目

先按[快速上手](../quickstart.md)创建并运行项目，确认业务接口可用。
在项目根目录保留 `pyproject.toml`、业务包和 `config*.yml`。

## 编写 Dockerfile

在业务项目根目录创建或调整 `Dockerfile`：

```dockerfile
FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN python -m pip install --no-cache-dir '.[components]' \
    && useradd --create-home appuser \
    && mkdir -p /app/logs \
    && chown -R appuser:appuser /app

USER appuser
ENV YUANBOOT_PROFILE=pro
EXPOSE 8080

CMD ["python", "-m", "yuanboot.cli", "run"]
```

默认模板从 PyPI 安装框架，无需 Git。显式切换为 Git 依赖时，需要自行在镜像中安装 Git。
模板的 `components` 安装全部标准组件；项目按需调整该可选依赖后，镜像也会使用相同依赖。

创建 `.dockerignore`，避免把本地环境和运行数据带入镜像：

```text
.git
.venv
__pycache__
*.pyc
.pytest_cache
dist
build
.env
.env.*
logs
data
```

MVC 项目的页面模板和业务静态文件应保留在镜像中。

## 构建镜像

```bash
docker build -t orders:0.1.0 .
```

镜像版本对应业务项目版本。升级框架时，先修改项目的框架依赖并重新构建镜像。

## 使用 Docker Compose

在部署目录准备 `config.yml`、`config_pro.yml` 和 `docker-compose.yml`：

```yaml
services:
  orders:
    image: orders:0.1.0
    ports:
      - "8080:8080"
    environment:
      YUANBOOT_PROFILE: pro
    volumes:
      - ./config.yml:/app/config.yml:ro
      - ./config_pro.yml:/app/config_pro.yml:ro
    init: true
    stop_grace_period: 30s
    restart: unless-stopped
    healthcheck:
      test:
        - CMD
        - python
        - -c
        - "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/actuator/health/readiness', timeout=2)"
      interval: 15s
      timeout: 3s
      start_period: 10s
      retries: 3
```

`config_pro.yml` 中 Web 监听地址应为 `:8080` 或 `0.0.0.0:8080`。
连接地址、账号等部署变量可放入业务自己的环境文件，通过 Compose 的 `env_file` 加载。
持久化文件日志时，将可写目录挂载到 `/app/logs`；仅采集控制台日志则无需该挂载。

## 启动与检查

```bash
docker compose up -d
docker compose ps
docker compose logs -f orders
curl -f http://127.0.0.1:8080/actuator/health/readiness
curl -f http://127.0.0.1:8080/actuator/health/detail
```

## 更新与停止

构建新镜像后，将 Compose 中的镜像版本改为新业务版本，再重新创建服务：

```bash
docker compose up -d
docker compose logs --tail=100 orders
docker compose down
```

使用远程镜像仓库时，在更新前执行 `docker compose pull`。
容器收到停止信号后，CLI 会将信号传给宿主，等待后台服务退出并释放连接资源。

## Console 与 gRPC 项目

Console 使用相同运行命令，不需要 HTTP 端口映射和上述 HTTP 健康检查。
gRPC 需要将 `yuanboot.grpc.address` 设为 `0.0.0.0:9090`，映射 `9090:9090`，
并使用 gRPC Health 检查，详见 [gRPC 服务](../grpc.md)。
