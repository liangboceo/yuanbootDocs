## 前言
Github开源：[github.com/liangboceo/yuanboot](https://github.com/liangboceo/yuanboot) 还请多多Star


## 从一个简单Web服务Demo出发
```go
package main
import ...

func main() {
    yuanboot.CreateDefaultBuilder(func(router Router.IRouterBuilder) {
        router.GET("/info",func (ctx *Context.HttpContext) {    // 支持Group方式
            ctx.JSON(200, Context.H{"info": "ok"})
        })
    }).Build().Run()       //默认端口号 :8080
}
```
## 框架基本概念
## 1.HostBuilder
HostBuilder本身是一个抽象概念(类)，可以衍生出多种**HostBuilder**。
比如：Web Host Builder , RPC Host Builder , General Host Builder等等。
上面的代码用**CreateDefaultBuilder**函数，创建的就是一个默认的**WebHostBuilder**，既然是WebHostBuilder那默认最重要的函数，那当然是用于Http路由的声明路由函数。HostBuilder本身包含了很多定义程序生命周期的函数：
1. **UseConfiguration**  : 用于定义配置文件
2. **Configure**         : 用于定义ApplicationBuilder,它是管理程序如何构建的一组方法
3. **ConfigureServices** : 用于定义IOC容器
4. **OnApplicationLifeEvent** : 用于定义程序生命周期的事件通知
5. **Build** : 用于生成最终可运行的Host对象

## 2.ApplicationBuilder
如果说程序是由Host对象装载的话，Host的构造就是由ApplicationBuilder完成的。Host本身就是由ApplicationBuilder与Server共同构成的。这两个对象一一对应，ApplicationBuilder用于构造，Server用于承载具体的应用协议。比如**WebHost**就是由WebApplicationBuilder构造并提供了**ServeHTTP**函数，由HttpServer来承载，共同完成的。

## 3.RouterBuilder
**RouterBuilder**是由**WebApplicationBuilder**衍生出来的路由定义对象，用于声明GET，POST，PUT，DELETE等类型的请求处理程序。也就是说没有创建WebHostBuilder就没有WebApplicationBuilder也就没有RouterBuilder；框架本身就是支持多种Server协议的。
路由函数定义：
```go
func(router *Router.RouterGroup) { }
```
上面demo中就通过它完成了一个GET请求，并返回JSON: {"info":"ok"}.
RouterBuilder本身还支持Group的方式，将一组API进行统一的URL定义：
```go
router.Group("/v1/api", func(router *Router.RouterGroup) {
     router.GET("/info", GetInfo)
     router.GET("/hello", GetHello)
})
```
通过以上代码将生成 /v1/api/info 和 /v1/api/hello 两个GET请求路由地址。
## 4.Host
创建**HostBuilder**后，通过**Build**函数得到了最终可运行的**Host**对象(**Build().Run() **)。 创建Host对象的同时，其实也完成了Server对象的创建，Host与Server一一对应的。Host表示了一个可运行的宿主，它负责管理整个程序的生命周期；而Server则是更为具体的服务类型，比如Http，xxRPC。Server更多是一种通讯协议上的表达。
## 5.定制WebHostBuilder
在上面的demo中，我们定义了一个默认的WebHostBuilder，但是它所支持的内容较少只提供了最基本的Host定义，那如何定制一个WebHostBuilder呢，如下例子：
```go
func CreateCustomBuilder() *Abstractions.HostBuilder {
	return yuanboot.NewWebHostBuilder().
		Configure(func(app *yuanboot.WebApplicationBuilder) {
		      app.UseEndpoints(unc(router Router.IRouterBuilder) {
                      router.GET("/info",func (ctx *Context.HttpContext) {
                           ctx.JSON(200, Context.M{"info": "ok"})
                      })
		})
}
```
通过定制，我们可以使用完整的HostBuilder构建函数来构建应用程序。然后通过如下例子将它运行起来：
```go
package main
import ...

func main() {
  CreateCustomBuilder().Build().Run() //默认端口 :8080
}
```
![](https://yuanboot.star2cloud.com/images/starup.png)


## 总结
至此我们介绍了yuanboot微服务框架的基本概念： 一个Web服务是由 WebHostBuilder -> WebApplicationBuilder -> HttpServer -> WebHost 组成。
![](https://yuanboot.star2cloud.com/images/HostBuilder时序图.png)
