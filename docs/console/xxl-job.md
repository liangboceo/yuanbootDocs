## xxl-job hosting

```go
import (
	"github.com/liangboceo/yuanboot/abstractions/configuration"
	"github.com/liangboceo/yuanboot/pkg/scheduler"
	"github.com/liangboceo/dependencyinjection"
)

func main() {
	// -f ./conf/test_conf.yml 指定配置文件 , 默认读取 config_{profile}.yml , -profile [dev,test,prod]
	config := configuration.YAML("config")

	scheduler.NewXxlJobBuilder(config).
		ConfigureServices(func(collection *dependencyinjection.ServiceCollection){
			scheduler.AddJobs(collection, NewDemoJob)
		}).
		Build().Run()
}


```

### Job 
```go
type DemoJob struct {
}

func NewDemoJob() *DemoJob {
	return &DemoJob{}
}

func (*DemoJob) Execute(cxt *scheduler.JobContext) (msg string) {
	cxt.Report("Job %d is beginning...", cxt.LogID)

	for i := 1; i <= 100; i++ {
		cxt.Report("Job Progress: %d Percent.", i)
		time.Sleep(time.Second)
	}

	return cxt.Done("666")
}

//GetJobName 自定义任务的名字
func (*DemoJob) GetJobName() string {
	return "job1"
}
```

### config.yml
```yaml
yuanboot:
  application:
    name: console-xxl-job
    metadata: "dev"
    server:
      type: "console"    # 宿主类型是 console
    xxl:
      serverAddr: http://127.0.0.1:8080/xxl-job-admin/
      #如未填写，会使用默认端口
      port: 9999
      #请求授权
      accessToken:
      #默认取本机地址
      ip:
      #如果registryKey不配置或者为空，将取yuanboot.application.name,此项为xxl-job后台的应用名，需要先创建
      registryKey: console-xxl-job
```