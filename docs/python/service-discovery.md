# 服务注册与发现

yuanboot Python 支持 Etcd、Nacos、Consul、Eureka 和进程内 Memory 注册中心。应用启动后注册实例并维持心跳，正常退出时注销；业务通过统一接口查询实例。

## 接入应用

先按[组件安装](versions.md#按需安装组件)安装所需依赖。在项目的宿主构建链中使用 `.use_components()`，或显式调用 `.use_service_discovery()`，然后挂载现有 Startup 并构建宿主。

各注册中心共用以下实例配置；将下方各节的 `cloud` 配置合并到同一个 `yuanboot` 节点：

```yaml
yuanboot:
  application:
    name: orders
    server:
      address: ":8080"
  cloud:
    discovery:
      ip: "${SERVICE_IP:127.0.0.1}"
      port: 8080
      heartbeat_interval: 5
      register-enable: true
      instance_metadata:
        region: cn
```

跨主机访问时，将 `SERVICE_IP` 设置为调用方能访问的地址。HTTP 与 gRPC 应分别注册实际监听端口；相同名称、IP 的不同实例需要不同端口。只查询其他服务时可设置 `register-enable: false`。

## Etcd

使用 etcd v3 HTTP gateway 地址：

```yaml
yuanboot:
  cloud:
    discovery:
      type: etcd
      metadata:
        server_addr: "${ETCD_URL:http://127.0.0.1:2379}"
        prefix: /yuanboot
        username: "${ETCD_USERNAME:}"
        password: "${ETCD_PASSWORD:}"
```

框架通过租约维护实例有效期。需要启用 Etcd 的 HTTP gateway，地址填写 HTTP(S) endpoint。

## Nacos

Nacos 连接信息放在 `yuanboot.cloud.nacos`，注册开关与实例信息放在 `discovery`：

```yaml
yuanboot:
  cloud:
    nacos:
      server_addr: "${NACOS_SERVER_ADDR:http://127.0.0.1:8848}"
      namespace: public
      group: DEFAULT_GROUP
      cluster: DEFAULT
      username: "${NACOS_USERNAME:}"
      password: "${NACOS_PASSWORD:}"
    discovery:
      type: nacos
```

服务发现与 Nacos 远程配置可分别启用。需要远程配置时，额外在 `ConfigurationBuilder` 中加入 `add_nacos()`，见[配置中心与热更新](components.md#配置中心与热更新)。实例 metadata、分组和注册行为见[Nacos metadata 与注册](components.md#nacos-metadata-与注册)。

## Consul

连接 Consul HTTP API，使用 TTL 检查维护实例状态：

```yaml
yuanboot:
  cloud:
    discovery:
      type: consul
      metadata:
        server_addr: "${CONSUL_URL:http://127.0.0.1:8500}"
        token: "${CONSUL_TOKEN:}"
        ttl: 15
```

启用 ACL 时提供有对应服务权限的 token。心跳间隔应小于 TTL。

## Eureka

地址包含 Eureka API 前缀：

```yaml
yuanboot:
  cloud:
    discovery:
      type: eureka
      metadata:
        server_addr: "${EUREKA_URL:http://127.0.0.1:8761/eureka}"
```

使用多个注册中心实例时，当前配置应提供单个可用 endpoint，可通过统一入口接入。

## 查询与调用服务

在已注册依赖的业务服务中注入 `ServiceDiscovery`：

```python
from yuanboot.components.discovery import ServiceDiscovery


class InventoryLocator:
    def __init__(self, discovery: ServiceDiscovery):
        self.discovery = discovery

    def locate(self):
        return self.discovery.select_instance("inventory")
```

`get_instances("inventory")` 返回健康实例，`select_instance` 默认轮询，也可选择 `strategy="random"`。
HTTP 调用可注入 `HttpClientFactory`，通过 `factory.create("lb://inventory")` 创建客户端，详见[HTTP、任务与消息](components.md#http、任务与消息)。这些查询和调用是同步 I/O，应放在同步动作或工作线程中。

本地单进程调试可使用 `type: memory`，它只保存当前进程内的实例，不能用于跨进程发现。
