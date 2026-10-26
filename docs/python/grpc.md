# gRPC 服务

## 创建与运行

```bash
yuanbootctl-python new grpc -n inventory --framework-version 0.1.9
cd inventory
python -m pip install -e '.[dev]'
yuanbootctl-python run --profile dev
```

`grpc` 模板自动声明 `yuanboot[grpc]` 依赖，默认监听 `127.0.0.1:9090`。
该项目通过 Console 入口运行 gRPC 宿主，不启动 HTTP `/docs` 页面。

## 配置监听地址

在 `config_pro.yml` 中设置：

```yaml
yuanboot:
  application:
    name: inventory
  grpc:
    address: "0.0.0.0:9090"
    shutdown_grace: 5
```

启动时使用 `yuanbootctl-python run --profile pro`。
Web 的 `--port` 不用于修改 gRPC 端口，gRPC 监听地址以 `yuanboot.grpc.address` 为准。

## 注册服务

`GrpcHostBuilder` 通过 `configure_server` 注册服务，示例：

```python
import grpc
from google.protobuf.wrappers_pb2 import StringValue
from yuanboot import ConfigurationBuilder
from yuanboot.grpc import GrpcHostBuilder


async def hello(request, context):
    return StringValue(value=f"Hello, {request.value}!")


def configure_server(server, services):
    handler = grpc.unary_unary_rpc_method_handler(
        hello,
        request_deserializer=StringValue.FromString,
        response_serializer=StringValue.SerializeToString,
    )
    server.add_generic_rpc_handlers((
        grpc.method_handlers_generic_handler("demo.Greeter", {"Hello": handler}),
    ))


config = ConfigurationBuilder().add_yaml_file().add_environment().build()
host = GrpcHostBuilder(config).use_components().configure_server(configure_server).build()

if __name__ == "__main__":
    host.run()
```

业务使用自己的 proto 时，将生成代码中的 `add_*Servicer_to_server` 放入 `configure_server`。
回调中的 `services` 可解析已注册的依赖。
支持通过 `configure_server(..., interceptors=..., credentials=...)` 传递拦截器和 TLS 凭据。

## 健康与停止

宿主注册标准 gRPC Health 服务。服务启动后状态为 SERVING，
停止时进入优雅关闭阶段，并按 `shutdown_grace` 等待请求结束。

启用服务发现时，注册端口应与真实 RPC 监听端口一致，见[组件配置与使用](components.md#nacos-metadata-与注册)。
