# Docker 部署

Docker 部署适合需要统一运行环境、快速迁移和自动重启的场景。下面以服务名 `example-server`、版本 `1.0.0-SNAPSHOT`、运行环境 `fat` 为例。

> 请根据实际项目修改服务名、版本、运行环境、镜像仓库和配置文件路径，并保证 Dockerfile 中的产物路径与 `build.sh` 完全一致。

## 准备构建脚本

项目根目录需要提供 `build.sh`。脚本可参考[宿主机部署](./host.md#编写构建脚本)中的示例，构建后应生成以下文件：

```text
build/example-server-linux-amd64/example-server-1.0.0-SNAPSHOT
```

## 编写 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM golang:1.26-alpine AS builder

WORKDIR /app
ENV GOPROXY=https://goproxy.cn,direct

COPY . .

ARG VERSION=1.0.0-SNAPSHOT
ARG PROFILE=fat

RUN chmod +x /app/build.sh \
    && /app/build.sh "${VERSION}" linux amd64 "${PROFILE}"

# 运行阶段
FROM alpine:latest

WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder \
    /app/build/example-server-linux-amd64/example-server-1.0.0-SNAPSHOT \
    /app/example-server
COPY --from=builder /app/conf/log.yml /app/conf/log.yml

ENV TZ=Asia/Shanghai

CMD ["/app/example-server"]
```

如果项目没有 `conf/log.yml`，请删除对应的 `COPY` 指令；如果版本号发生变化，需要同步修改运行阶段的产物路径。

## 构建镜像

在项目根目录执行：

```bash
docker build \
  --build-arg VERSION=1.0.0-SNAPSHOT \
  --build-arg PROFILE=fat \
  -t registry.example.com/example-server:fat .
```

需要推送到镜像仓库时执行：

```bash
docker login registry.example.com
docker push registry.example.com/example-server:fat
```

## 编写 docker-compose.yml

在部署目录创建 `docker-compose.yml`：

```yaml
version: "3"

services:
  example-server:
    image: registry.example.com/example-server:fat
    container_name: example-server
    environment:
      TZ: Asia/Shanghai
      YUANBOOT_PROFILE: fat
    volumes:
      - /etc/hosts:/etc/hosts:ro
      - /mnt/data/log:/mnt/data/log
    network_mode: host
    restart: always
```

`network_mode: host` 表示容器直接使用宿主机网络，服务端口不需要再通过 `ports` 映射。若不使用宿主机网络，请删除该配置并按实际端口增加 `ports`，例如 `8080:8080`。

## 启动和更新服务

```bash
# 启动服务
docker compose up -d

# 查看状态和日志
docker compose ps
docker compose logs -f example-server

# 拉取新镜像并重新创建容器
docker compose pull
docker compose up -d

# 停止服务
docker compose down
```

部署完成后，应通过服务的健康检查接口或实际业务接口确认服务可以正常访问。
