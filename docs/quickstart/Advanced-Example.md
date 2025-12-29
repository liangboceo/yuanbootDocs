```go
package main
import (
	WebApplication "github.com/liangboceo/yuanboot/web"
        ......
)

func main() {
	webHost := CreateCustomBuilder().Build()
	webHost.Run()
}


// 自定义HostBuilder并支持 MVC 和 自动参数绑定功能，简单情况也可以直接使用CreateDefaultBuilder 。
func CreateCustomBuilder() *abstractions.HostBuilder {

	configuration := abstractions.NewConfigurationBuilder().
		AddEnvironment().
		AddYamlFile("config").Build()

	return WebApplication.NewWebHostBuilder().
		UseConfiguration(configuration).
		Configure(func(app *WebApplication.WebApplicationBuilder) {
			app.UseMiddleware(middlewares.NewCORS())
			//WebApplication.UseMiddleware(middlewares.NewRequestTracker())
			app.UseStaticAssets()
			app.UseEndpoints(registerEndpointRouterConfig)
			app.UseMvc(func(builder *mvc.ControllerBuilder) {
				//builder.AddViews(&view.Option{Path: "./Static/templates"})
				builder.AddViewsByConfig()
				builder.AddController(contollers.NewUserController)
				builder.AddFilter("/v1/user/info", &contollers.TestActionFilter{})
			})
		}).
		ConfigureServices(func(serviceCollection *dependencyinjection.ServiceCollection) {
			serviceCollection.AddTransientByImplements(models.NewUserAction, new(models.IUserAction))
			serviceCollection.AddSingletonByImplementsAndName("db1", datasources.NewMysqlDataSource, new(abstractions.IDataSource))
			serviceCollection.AddSingletonByImplementsAndName("redis1", datasources.NewRedis, new(abstractions.IDataSource))

			//eureka.UseServiceDiscovery(serviceCollection)
			//consul.UseServiceDiscovery(serviceCollection)
			nacos.UseServiceDiscovery(serviceCollection)
		}).
		OnApplicationLifeEvent(getApplicationLifeEvent)
}

//region endpoint 路由绑定函数
func registerEndpoints(rb router.IRouterBuilder) {
	Endpoints.UseHealth(rb)
	Endpoints.UseViz(rb)
	Endpoints.UsePrometheus(rb)
	Endpoints.UsePprof(rb)
	Endpoints.UseJwt(rb)

	rb.GET("/error", func(ctx *context.HttpContext) {
		panic("http get error")
	})

	//POST 请求: /info/:id ?q1=abc&username=123
	rb.POST("/info/:id", func(ctx *context.HttpContext) {
		qs_q1 := ctx.Query("q1")
		pd_name := ctx.Param("username")

		userInfo := &UserInfo{}

		_ = ctx.Bind(userInfo) // 手动绑定请求对象

		strResult := fmt.Sprintf("Name:%s , Q1:%s , bind: %s", pd_name, qs_q1, userInfo)

		ctx.JSON(200, context.H{"info": "hello world", "result": strResult})
	})

	// 路由组功能实现绑定 GET 请求:  /v1/api/info
	rb.Group("/v1/api", func(router *router.RouterGroup) {
		router.GET("/info", func(ctx *context.HttpContext) {
			ctx.JSON(200, context.H{"info": "ok"})
		})
	})

	// GET 请求: HttpContext.RequiredServices获取IOC对象
	rb.GET("/ioc", func(ctx *context.HttpContext) {
		var userAction models.IUserAction
		_ = ctx.RequiredServices.GetService(&userAction)
		ctx.JSON(200, context.H{"info": "ok " + userAction.Login("zhang")})
	})
}

//endregion

//region 请求对象
type UserInfo struct {
	UserName string `param:"username"`
	Number   string `param:"q1"`
	Id       string `param:"id"`
}

// ----------------------------------------- MVC 定义 ------------------------------------------------------

// 定义Controller
type UserController struct {
	*mvc.ApiController
	userAction models.IUserAction // IOC 对象参数
}

// 构造器依赖注入
func NewUserController(userAction models.IUserAction) *UserController {
	return &UserController{userAction: userAction}
}

// 请求对象的参数化绑定
type RegiserRequest struct {
	mvc.RequestBody
	UserName string `param:"username"`
	Password string `param:"password"`
}

// Register函数自动绑定参数
func (this *UserController) Register(ctx *context.HttpContext, request *RegiserRequest) actionresult.IActionResult {
	result := mvc.ApiResult{Success: true, Message: "ok", Data: request}
	return actionresult.Json{Data: result}
}

// use userAction interface by ioc  
func (this *UserController) GetInfo() mvc.ApiResult {
	return this.OK(this.userAction.Login("zhang"))
}

// Web程序的开始与停止事件
func fireApplicationLifeEvent(life *abstractions.ApplicationLife) {
	printDataEvent := func(event abstractions.ApplicationEvent) {
		fmt.Printf("[yuanboot] Topic: %s; Event: %v\n", event.Topic, event.Data)
	}
	for {
		select {
		case ev := <-life.ApplicationStarted:
			go printDataEvent(ev)
		case ev := <-life.ApplicationStopped:
			go printDataEvent(ev)
			break
		}
	}
}
```