# 配置文件与多环境


```python
from yuanboot import ConfigurationBuilder

config = (
    ConfigurationBuilder(".")
    .add_defaults({"greeting": {"message": "hello"}})
    .add_yaml_file("config")
    .add_environment()
    .add_flag_args()  # 显式启用，避免干扰宿主/测试的参数
    .build()
)
```

优先级：默认值 < `config.yml` < `config_<profile>.yml` < 远程配置（Nacos/Apollo/自定义源）< 环境变量 < CLI。
profile 默认 `dev`，通过 `build(profile="pro")`、`YUANBOOT_PROFILE` 或 `--profile` 选择；profile 文件与基础文件递归合并。
环境名统一为 `dev / fat / uat / pro`，其他值会在启动前报错。模板包含这四个环境的配置文件。
MySQL、Redis、Nacos 等基础设施由配置决定，不能使用 `cloud` 作为环境名。
支持 JSON、可选文件、`${ENV:default}` 插值、点路径查询和 Pydantic 模型绑定。

```yaml
yuanboot:
  application:
    name: demo
    server:
      address: ":8080"
      # 也可使用 host/port（不要同时设置 address）
      # tls:
      #   cert: ./cert.pem
      #   key: ./key.pem
database:
  url: "${DATABASE_URL:sqlite:///demo.db}"
```

`YUANBOOT_DATABASE__URL` 对应 `database.url`；双下划线表示层级。
完整框架键以 `YUANBOOT_YUANBOOT__APPLICATION__NAME` 覆盖，常用名称和端口有短写 `YUANBOOT_APP`、`YUANBOOT_PORT`。
配置值可通过 `get_string/get_int/get_bool/get_section` 读取；`config.bind(MySettings, "database")` 校验为 Pydantic 模型。
缺失必需文件、未提供默认值的环境插值及错误配置会立即报错。
显式启用 flag 解析时支持 `--app --port --profile --conf -f`，忽略其他工具的参数。
模板默认从**当前项目目录**读取配置，运行已打包项目时也应提供外部配置文件。


## 配置文件布局

```text
config.yml
config_dev.yml
config_fat.yml
config_uat.yml
config_pro.yml
```

基础配置放在 `config.yml`，各环境仅覆盖有差异的字段。
启动命令在项目目录执行，使配置文件与 CLI 的工作目录一致：

```bash
yuanbootctl-python run --profile dev
yuanbootctl-python run --profile fat
yuanbootctl-python run --profile uat
yuanbootctl-python run --profile pro
```

也可设置 `YUANBOOT_PROFILE=pro`；显式 `--profile` 优先于环境变量。
`YUANBOOT_PORT=9000` 覆盖监听端口。

## 配置读取与模型绑定

```python
from pydantic import BaseModel


class DatabaseSettings(BaseModel):
    url: str


message = config.get_string("greeting.message", "Hello")
port = config.get_int("yuanboot.application.server.port", 8080)
database = config.bind(DatabaseSettings, "database")
```

使用环境变量插值把部署环境中的连接信息传给应用：

```yaml
database:
  url: "${DATABASE_URL:sqlite:///orders.db}"
```

Nacos、Apollo 与热更新的接入方法见[组件配置与使用](components.md#配置中心与热更新)。
