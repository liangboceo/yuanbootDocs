# ActionFiler
ActionFilter只应用于MVC模式，使用UseMvc开启Mvc中间件；在ControllerBuilder中创建Filter. 支持正则表达式与统配符*.
```go
func CreateCustomBuilder() *abstractions.HostBuilder {
        configuration := abstractions.NewConfigurationBuilder().
		AddEnvironment().
		AddYamlFile("config").Build()

	return yuanboot.NewWebHostBuilder().
		UseConfiguration(configuration)
		Configure(func(app *yuanboot.WebApplicationBuilder) {
			app.UseMvc(func(builder *mvc.ControllerBuilder) {
				builder.AddController(contollers.NewUserController)
				builder.AddFilter("/v1/user/info", &contollers.TestActionFilter{})
			})
		})
}
```
# ActionFilter定义
它实现了IActionFilter接口，如下是它的实例定义.
```go
type TestActionFilter struct {
}

func (f *TestActionFilter) OnActionExecuting(context mvc.ActionFilterContext) bool {
	fmt.Println("TestActionFilter OnActionExecuting")
	return false
}

func (f *TestActionFilter) OnActionExecuted(context mvc.ActionFilterContext) {
	fmt.Println("TestActionFilter OnActionExecuted")
}

```