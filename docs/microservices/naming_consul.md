## 服务发现
```go
app.NewWebHostBuilder().
	UseConfiguration(configuration).
	ConfigureServices(func(serviceCollection *dependencyinjection.ServiceCollection) {
        // 依赖注入 Consul 服务发现组件
		Consul.UseServiceDiscovery(serviceCollection)
 }).Build().Run()
```
### consul配置：
```yaml
yuanboot:
  application:
    name: demo_dev
    metadata: "develop"
  cloud:
    discovery:
      cache:
        ttl: 30     # seconds 服务列表缓存时间 （秒）
	  type: "consul"
	  metadata:
		address: "localhost:8500"
		health_check: "/actuator/health"
		tags: [""]
```

### 获取服务实例
新建一个Controller，并在GetSD函数中获取demo_dev服务的所有实例
```go
type SDController struct {
	mvc.ApiController
	discoveryCache  servicediscovery.Cache
	discoveryClient servicediscovery.IServiceDiscoveryClient
}

func NewSDController(sd servicediscovery.IServiceDiscoveryClient, cache servicediscovery.Cache) *SDController {
	return &SDController{discoveryClient: sd, discoveryCache: cache}
}

func (controller SDController) GetSD() mvc.ApiResult {
	serviceList := controller.discoveryClient.GetAllInstances("yuanboot_demo_dev")
	return controller.OK(serviceList)
}

func (controller SDController) GetServices() mvc.ApiResult {
	serviceList, _ := controller.discoveryClient.GetAllServices()
	return controller.OK(serviceList)
}
```