# Host Service 场景
有时候可能需要建立一些独立于应用逻辑体本身的后台任务。比如：定时发送邮件、定时执行脚本这类持续运行的任务，也有验证数据库是否创建等只伴随应用启动而执行一次的任务。

我们提供了一个叫做 IHostedService 的接口，它可以便于我们更好的实现托管服务。

**它是伴随hosting一同启动的任务,并拥有相同的生命周期。**

目前我们实现了xxl-job的场景，用于定时的后台任务，并常驻进程。


### IHostService接口
```go
type IHostService interface {
    // Run Triggered when the application host is ready to start the service.
	Run() error
    // Stop Triggered when the application host is performing a graceful shutdown.
	Stop() error
}
```

### 实现一个HostService
```go
type Service1 struct {
}

// 这里可以注入类型参数
func NewService() *Service1 {
	return &Service1{}
}

func (s *Service1) Run() error {
	fmt.Println("host service Running")
	return nil
}

func (s *Service1) Stop() error {
	fmt.Println("host service Stopping")
	return nil
}
```

### 注册HostService
需要将实现接口注册到DI交由框架管理，HostService作为框架的扩展点，在Hosting启动与关闭时会自动调用HostService的相应方法
```go
ConfigureServices(func(collection *dependencyinjection.ServiceCollection) {
		hosting.AddHostService(collection, NewService)
})
```
这里注册的**NewService**构造器可以使用DI带来的参数注入等特性。一个Hosting宿主可以注册多个HostService

