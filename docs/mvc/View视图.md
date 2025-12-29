## 视图配置
```go
//...
.Configure(func(app *yuanboot.WebApplicationBuilder) {
        app.UseMvc(func(builder *mvc.ControllerBuilder) {
                builder.AddViewsByConfig()
        }
}
```

## hello.tpl 
存放在在静态目录 /static/templates/ :
```
<h1>{[{.name}]}</h1>
```

## 控制器
```go
func (controller UserController) GetHtmlHello() actionresult.IActionResult {
	return controller.View("hello", map[string]interface{}{
		"name": "hello world!",
	})
}
```