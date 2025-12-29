```go
package main

import (
	WebApplication "github.com/liangboceo/yuanboot/web"
        ......
)

func main() {
	webHost := CreateCustomWebHostBuilder().Build()
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
				//builder.AddViews(&view.Option{Path: "./static/templates"})
				builder.AddViewsByConfig()
				builder.AddController(contollers.NewUserController)
				builder.AddFilter("/v1/user/info", &contollers.TestActionFilter{})
			})
		}).
		ConfigureServices(func(serviceCollection *dependencyinjection.ServiceCollection) {
			serviceCollection.AddTransientByImplements(models.NewUserAction, new(models.IUserAction))
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

	//swagger api document
	endpoints.UseSwaggerDoc(rb,
		swagger.Info{
			Title:          "yuanboot 框架文档演示",
			Version:        "v1.0.0",
			Description:    "框架文档演示swagger文档 v1.0 [ #yuanboot](https://github.com/liangboceo/yuanboot).",
			TermsOfService: "https://yuanboot.star2cloud.com/",
			Contact: swagger.Contact{
				Email: "173120209@qq.com",
				Name:  "yuanboot",
			},
			License: swagger.License{
				Name: "MIT",
				Url:  "https://opensource.org/licenses/MIT",
			},
		},
		func(openapi *swagger.OpenApi) {
			openapi.AddSecurityBearerAuth()
		})

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

// 请求对象的参数化绑定 , 使用 doc属性标注 支持swagger文档
type RegisterRequest struct {
	mvc.RequestBody `route:"/api/users/register" doc:"用户注册"`
	UserName        string `uri:"userName" doc:"用户名"`
	Password        string `uri:"password" doc:"密码"`
	TestNumber      uint64 `uri:"num" doc:"数字"`
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

// DocumentResponse custom document response , use doc tag for swagger
type DocumentResponse struct {
	Message string        `json:"message" doc:"消息"`
	List    []DocumentDto `json:"list" doc:"文档列表"`
	Success bool          `json:"success" doc:"是否成功"`
}

// Swagger API 文档支持
func (controller UserController) GetDocumentList(request *struct {
	mvc.RequestGET `route:"/v1/user/doc/list" doc:"获取全部文档列表"`
}) DocumentResponse {

	return DocumentResponse{Message: "GetDocumentList", List: []DocumentDto{
		{Id: 1, Name: "test1", Time: time.Now()}, {Id: 2, Name: "test2", Time: time.Now()},
		{Id: 3, Name: "test3", Time: time.Now()}, {Id: 4, Name: "test4", Time: time.Now()},
		{Id: 5, Name: "test5", Time: time.Now()}, {Id: 6, Name: "test6", Time: time.Now()},
	}, Success: true}
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