## console
```go
import (
	"github.com/liangboceo/yuanboot/abstractions"
	"github.com/liangboceo/yuanboot/console"
)

func main() {
	// -f ./conf/test_conf.yml 指定配置文件 , 默认读取 config_{profile}.yml , -profile [dev,test,prod]
	config := abstractions.NewConfigurationBuilder().
		AddEnvironment().
		AddYamlFile("config").Build()

	console.NewHostBuilder().
		UseConfiguration(config).
		UseStartup(Startup).
		Build().
		Run()
}
```

### Startup
```go
import (
	"github.com/liangboceo/yuanboot/abstractions"
	"github.com/liangboceo/yuanboot/abstractions/hosting"
	"github.com/liangboceo/dependencyinjection"
)

type AppStartup struct {
}

func Startup() abstractions.IStartup {
	return &AppStartup{}
}

func (s *AppStartup) ConfigureServices(collection *dependencyinjection.ServiceCollection) {
	hosting.AddHostService(collection, NewService)
}



// HostService 用于管理程序生命周期

type Service1 struct {
}

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