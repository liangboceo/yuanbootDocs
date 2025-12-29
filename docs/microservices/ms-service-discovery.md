## 服务发现
```go
  app.NewWebHostBuilder().
	  UseConfiguration(configuration).
	  ConfigureServices(func(serviceCollection *dependencyinjection.ServiceCollection) {
      // 依赖注入 Nacos 服务发现组件
		  nacos.UseServiceDiscovery(serviceCollection)
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
      register-enable: true  # 是否注册自身  (默认true ,非必填)
      type: "nacos"
      metadata:
        url: "localhost"   #local1;local2 使用";"分隔.
        port: 8848
        namespace: "a3ae02e6-79e9-4150-bcfd-93eb8f9b0235"
        group: "mygroup1"
        cluster: ""
        auth:
          enable: true
          username: "root"
          password: "1234"
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