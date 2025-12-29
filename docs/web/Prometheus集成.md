## Prometheus
**Prometheus**是一个非常棒的工具，结合**grafana**能够让我在不写代码，或者少写代码的情况下搭建一套有效的监控体系。这里介绍一下**Prometheus**监控**golang**程序的方式。

## Golang 服务程序
**Golang**的Web程序，我使用了**yuanboot**框架，[《 yuanboot基于ASP.NET Core设计的Golang实现 》](https://www.cnblogs.com/maxzhang1985/p/12981989.html) 可以查看这篇文章进行了解。 最新也发布了最新的**v1.5.0**版本，下面**Prometheus**接口就是这个版本的新功能。
想要程序能够被监控，就必须要将程序运行中的各项目指标暴露出来，提供给**Promtheus**进行信息采集，当然**Prometheus**也提供push的方式，本例中将使用拉的方式。我们可以使用**Prometheus**提供的**golang**客户端暴露自身的运行时信息。代码例子如下:
```go
import (
	yuanboot "github.com/liangboceo/yuanboot/web"
	"github.com/liangboceo/yuanboot/web/context"
	"github.com/liangboceo/yuanboot/web/endpoints"
)

func main(){
	yuanboot.CreateDefaultBuilder(func(rb router.IRouterBuilder) {
		Endpoints.UsePrometheus(rb)

		rb.GET("/info", func (ctx *context.HttpContext) {
			ctx.JSON(200, context.M{"info": "ok"})
		})
	}).Build().Run()
}
```
![](https://yuanboot.star2cloud.com/images/starup.png)

访问本地的8080端口就能看到监控的指标,这里监控的都是默认指标，当然你可以可以自定义你需要的量化的指标，然后暴露出来，这里就不多介绍了。

![](https://yuanboot.star2cloud.com/images/20200811104756.png)

## 配置 Prometheus
在[Prometheus官网](https://prometheus.io/download/)下载后，我们来配置下 **Prometheus**，让它为我们采集的Golang服务程序的监控指标：

**prometheus.yml**：
```yml
- job_name: 'golang'
    scrape_interval: 10s
    metrics_path: /actuator/metrics
    static_configs:
      - targets: ['localhost:8080']
```
启动 **Prometheus** ：
```bash
.\prometheus.exe
```

启动Promethues等待10s，Golang指标就会被采集到Promethues的时序数据库中了，访问 http://localhost:9090/ 得到如下效果

![](https://yuanboot.star2cloud.com/images/20200811110139.png)

## Grafana
在[Grafana官网](https://grafana.com/grafana/download)下载后，接下来就是把这些指标在grafana图形化展示出来：

启动**Grafana**：
```bash
./grafana-server
```
进入http://localhost:3000/ 后，配置数据源 **DataSource**，Dashboard直接使用了官方插件 **10826** 导入这个ID后，最后展示出来的效果如下:
![](https://yuanboot.star2cloud.com/images/20200811110440.png)
