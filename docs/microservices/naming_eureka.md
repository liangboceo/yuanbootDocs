## 服务发现
```go
app.NewWebHostBuilder().
	UseConfiguration(configuration).
	ConfigureServices(func(serviceCollection *dependencyinjection.ServiceCollection) {
    // 依赖注入 Eureka 服务发现组件
		eureka.UseServiceDiscovery(serviceCollection)
 }).Build().Run()
```
### eureka配置：
```yaml
yuanboot:
  application:
    name: demo_dev
    metadata: "develop"
  cloud:
    discovery:
      cache:
        ttl: 30     # seconds
      type: "eureka"
      metadata:
        address: 
          - "http://localhost:5000/eureka"
```

### 获取服务实例
新建一个Controller，并在GetSD函数中获取demo_dev服务的所有实例
```go
type UserController struct {
	Mvc.ApiController
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