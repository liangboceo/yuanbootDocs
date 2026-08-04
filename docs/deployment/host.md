# 宿主机部署

宿主机部署是将 Go 可执行文件直接安装到 Linux 服务器，并通过 systemd 管理服务进程。下面以 `example-server` 为示例服务名。

> `example-server` 只是示例。部署时必须将服务名、模块路径、版本、运行环境、安装目录和配置文件替换为实际值。

## 编写构建脚本

在项目根目录创建 `build.sh`：

```sh
#!/bin/sh
set -eu

APP_NAME="example-server"
VERSION_PATH="example-server/version"

if [ "$#" -lt 4 ]; then
  echo "Usage: $0 <version> <os> <arch> <profile>"
  echo "Example: $0 1.0.0-SNAPSHOT linux amd64 prod"
  exit 1
fi

VERSION="$1"
TARGET_OS="$2"
TARGET_ARCH="$3"
PROFILE="$4"
OUTPUT_DIR="build/${APP_NAME}-${TARGET_OS}-${TARGET_ARCH}"
BINARY_NAME="${APP_NAME}-${VERSION}"

if [ "${TARGET_OS}" = "windows" ]; then
  BINARY_NAME="${BINARY_NAME}.exe"
fi

echo "Downloading Go modules..."
go mod download

rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

CGO_ENABLED=0 GOOS="${TARGET_OS}" GOARCH="${TARGET_ARCH}" \
  go build \
  -ldflags="-s -w -X ${VERSION_PATH}.env=${PROFILE}" \
  -o "${OUTPUT_DIR}/${BINARY_NAME}" .

echo "Built ${OUTPUT_DIR}/${BINARY_NAME}"
```

其中 `VERSION_PATH` 必须指向项目中版本变量所在的 Go 包。例如项目的 module 为 `github.com/example/example-server`，版本包为 `version`，则应设置为：

```sh
VERSION_PATH="github.com/example/example-server/version"
```

## 构建服务

```bash
chmod +x build.sh
./build.sh 1.0.0-SNAPSHOT linux amd64 prod
```

构建产物位于：

```text
build/example-server-linux-amd64/example-server-1.0.0-SNAPSHOT
```

## 安装到服务器

以下示例将服务安装到 `/mnt/data/app/example-server`：

```bash
sudo mkdir -p /mnt/data/app/example-server
sudo install -m 0755 \
  build/example-server-linux-amd64/example-server-1.0.0-SNAPSHOT \
  /mnt/data/app/example-server/example-server-1.0.0-SNAPSHOT

# 按项目实际情况安装配置文件
sudo install -m 0644 config.yml /mnt/data/app/example-server/config.yml
```

## 编写 systemd 服务

systemd 服务文件应放在 `/lib/systemd/system/` 下，文件名必须使用实际服务名：

```text
/lib/systemd/system/<实际服务名>.service
```

例如实际服务名为 `example-server`，则创建 `/lib/systemd/system/example-server.service`：

```ini
[Unit]
Description=example-server
After=network.target

[Service]
Type=simple
WorkingDirectory=/mnt/data/app/example-server
ExecStart=/mnt/data/app/example-server/example-server-1.0.0-SNAPSHOT -f /mnt/data/app/example-server/config.yml
Restart=always
RestartSec=5
User=root
Environment=GIN_MODE=release
Environment=YUANBOOT_PROFILE=prod

[Install]
WantedBy=multi-user.target
```

请按实际项目调整以下配置：

| 配置项 | 说明 |
| --- | --- |
| `Description` | 使用实际服务名或服务说明 |
| `WorkingDirectory` | 服务的实际安装目录 |
| `ExecStart` | 可执行文件、版本号和启动参数 |
| `User` | 运行服务的系统用户；生产环境建议使用专用低权限用户 |
| `Environment` | 服务需要的运行环境变量 |

如果服务不使用 `-f` 指定配置文件，请从 `ExecStart` 中删除该参数。

## 启动和管理服务

每次新增或修改 service 文件后，必须先重新加载 systemd 配置：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now example-server
```

常用管理命令：

```bash
# 查看状态
sudo systemctl status example-server

# 重启或停止服务
sudo systemctl restart example-server
sudo systemctl stop example-server

# 查看实时日志
sudo journalctl -u example-server -f
```

所有命令中的 `example-server` 都要替换为实际服务名，并与 `/lib/systemd/system/<实际服务名>.service` 的文件名保持一致。

## 更新服务

先构建并上传新版本，再替换服务器上的可执行文件。如果文件名包含新版本号，还需要同步修改 service 文件中的 `ExecStart`：

```bash
sudo systemctl stop example-server
sudo install -m 0755 \
  build/example-server-linux-amd64/example-server-1.0.1 \
  /mnt/data/app/example-server/example-server-1.0.1
sudo systemctl daemon-reload
sudo systemctl start example-server
sudo systemctl status example-server
```
