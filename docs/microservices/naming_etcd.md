## 服务发现
```go
  app.NewWebHostBuilder().
	 UseConfiguration(configuration).
	 ConfigureServices(func(serviceCollection *dependencyinjection.ServiceCollection) {
      // 依赖注入 ETCD 服务发现组件
		  etcd.UseServiceDiscovery(serviceCollection)
   }).Build().Run()
```
### Nacos配置：
```yaml
yuanboot:
  application:
    name: demo_dev
    metadata: "develop"
  cloud:
    discovery:
      cache:
        ttl: 30     # seconds 服务列表缓存时间 （秒）
      type: "etcd"
      metadata:
      address:
        - "localhost:32379"
      namespace: "public"
      ttl: 60
      auth:
        enable: true
        username: "root"
        password: "5z1fLbYw8A"
```

### 获取服务实例
新建一个Controller，并在GetSD函数中获取demo_dev服务的所有实例
```go
type UserController struct {
	mvc.ApiController
	discoveryClient serverdiscovery.IServerDiscovery
}

func NewUserController(sd serverdiscovery.IServerDiscovery) *UserController {
	return &UserController{ discoveryClient: sd}
}

func (controller UserController) GetSD() mvc.ApiResult {
	serviceList := controller.discoveryClient.GetAllInstances("demo_dev")
	return controller.OK(serviceList)
}
```