## 框架安装
```bash
go get github.com/liangboceo/yuanboot
```
## 简单的开始
```go 
package main
import (
    WebApplication "github.com/liangboceo/yuanboot/web"
    ......
)

func main() {
    webHost := WebApplication.CreateDefaultBuilder(func(rb router.IRouterBuilder) {
        rb.GET("/info",func (ctx *context.HttpContext) {
            ctx.JSON(200, context.H{"info": "ok"})
        })
    }).Build().Run()       //default port :8080
}
```
