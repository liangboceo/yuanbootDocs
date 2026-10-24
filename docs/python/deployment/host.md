# 宿主机部署

Python 服务使用虚拟环境安装依赖，再由 systemd 管理进程。
下面以 Linux 服务器中的 Web 服务 `orders` 为例，项目目录为 `/opt/orders`，部署环境为 `pro`。

## 准备业务项目

将业务代码和配置复制到服务器，目录应包含：

```text
/opt/orders/
├── orders/
├── pyproject.toml
├── README.md
├── config.yml
└── config_pro.yml
```

MVC 项目的视图、静态文件也需一并部署。
确认 `pyproject.toml` 中框架依赖已固定为实际存在的 tag，见[版本与安装](../versions.md)。

## 安装运行环境

服务器需安装 Python 3.11+、venv 支持和 Git。使用业务专用账户运行服务：

```bash
sudo useradd --system --home-dir /opt/orders --shell /usr/sbin/nologin orders
sudo chown -R orders:orders /opt/orders

sudo -u orders python3 -m venv /opt/orders/.venv
cd /opt/orders
sudo -u orders /opt/orders/.venv/bin/python -m pip install '.[components]'
```

`components` 为模板提供的标准组件可选依赖，纯 Web 项目也可只安装 `.`。
使用 uv 等工具管理项目时，在部署环境按业务锁文件安装相同版本的依赖。

## 配置生产环境

修改 `/opt/orders/config_pro.yml`：

```yaml
yuanboot:
  application:
    name: orders
    server:
      address: ":8080"
  logging:
    level: INFO
    json: true
    console: true
```

基础配置中的环境变量引用由部署环境提供。
需要单独保存变量时，创建 `/etc/orders.env`，例如：

```text
YUANBOOT_PROFILE=pro
YUANBOOT_PORT=8080
```

## 编写 systemd 服务

创建 `/etc/systemd/system/orders.service`：

```ini
[Unit]
Description=orders Python service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=orders
Group=orders
WorkingDirectory=/opt/orders
Environment=PYTHONUNBUFFERED=1
Environment=YUANBOOT_PROFILE=pro
EnvironmentFile=-/etc/orders.env
ExecStart=/opt/orders/.venv/bin/yuanbootctl-python run --profile pro --workers 2
Restart=on-failure
RestartSec=5
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
```

`WorkingDirectory` 决定 `pyproject.toml`、配置文件和相对路径的读取位置。
`ExecStart` 必须指向业务虚拟环境的解释器。部署时不使用 `--reload`。
多 worker 会分别运行后台服务；有独占后台任务时使用单 worker，或将任务拆成独立 Console 服务。

## 启动与管理

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now orders
sudo systemctl status orders
sudo journalctl -u orders -f
```

检查服务：

```bash
curl -f http://127.0.0.1:8080/actuator/health/readiness
curl -f http://127.0.0.1:8080/actuator/health/detail
```

## 更新服务

更新业务代码、框架依赖或配置后，重新安装项目并重启：

```bash
sudo systemctl stop orders
# 将新业务版本复制到 /opt/orders，保留部署配置。
cd /opt/orders
sudo -u orders /opt/orders/.venv/bin/python -m pip install --upgrade '.[components]'
sudo systemctl start orders
sudo systemctl status orders
```

修改 service 文件后先执行 `sudo systemctl daemon-reload`。
更新后检查健康状态和业务接口，日志通过 `journalctl` 查看。

## Console 与 gRPC

Console 和 gRPC 服务将 `ExecStart` 改为：

```ini
ExecStart=/opt/orders/.venv/bin/yuanbootctl-python run --profile pro
```

这两类项目通过 `pyproject.toml` 的 Console 入口启动，不使用 Web 的 `--workers` 参数。
gRPC 端口在 `config_pro.yml` 的 `yuanboot.grpc.address` 中配置。
