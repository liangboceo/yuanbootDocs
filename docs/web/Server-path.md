## 设置HTTP服务路由
server.path of the application. 应用的上下文路径，也可以称为项目路径，是构成url地址的一部分。 如下设置后，路由定义 router.GET("/info"...) , 访问URL为: http://localhost:8080/app/info , 而不是http://localhost:8080/info
```yml
yuanboot:
  application:
    name: yuanboot_demo_dev
    metadata: "develop"
    server:
      type: "fasthttp"
      address: ":8080"
      path: "app"
      max_request_size: 2096157
      mvc:
        template: "/v1/{controller}/{action}"
```
```go
...
...
app.UseEndpoints(registerEndpointRouterConfig)
...
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
```


## 设置MVC路由模板
mvc.template 其中 {controller} 和 {action} 为固定参数，表示控制器和执行方法；按URL方式填写。
```go
type UserController struct {
	mvc.ApiController
	userAction models.IUserAction
}

func NewUserController(userAction models.IUserAction) *UserController {
	return &UserController{userAction: userAction}
}

func (controller UserController) GetInfo() mvc.ApiResult {
	return controller.OK(controller.userAction.Login("zhang"))
}



package main
import (
	yuanboot "github.com/liangboceo/yuanboot/web"
        ......
)

func main() {
    configuration := abstractions.NewConfigurationBuilder().
		AddEnvironment().
		AddYamlFile("config").Build()
		
    yuanboot.NewWebHostBuilder().
           UseConfiguration(configuration).
           Configure(func(app *yuanboot.WebApplicationBuilder) {
               app.UseMvc(func(builder *mvc.ControllerBuilder) {
                   builder.AddController(contollers.NewUserController)
               })
          }).Build().Run()
}
```
