## Nacos远程配置集成

### 创建配置对象
```go
	config := configuration.NACOS("config")
    // 或
    abstractions.NewConfigurationBuilder().AddEnvironment().AddYamlFile(“config”).Build()
```

### 配置文件
```yaml
yuanboot:
  application:
    name: yuanboot_demo_dev
    metadata: "develop"
    server:
      type: "fasthttp"
      address: ":8080"
    cloud:
        discovery:
        cache:
            ttl: 30     # seconds
        strategy: "round-robin"    # round-robin  , weight-time ,  random
        type: "nacos"
        metadata:
            url: "127.0.0.1"
            port: 8080
            namespace: "public"
            group: "DEFAULT_GROUP"
            cluster: ""
            configserver:
                dataId: "simple_demo"      # nacos的 DataId
            auth:
                enable: true
                username: "root"
                password: "1234"
```