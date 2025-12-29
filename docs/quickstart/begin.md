<img src="https://yuanboot.star2cloud.com/images/logo.png" width = "380px" height = "120px" alt="" align=center />[中文](https://github.com/liangboceo/yuanboot/blob/master/README.md)  / [English](https://github.com/liangboceo/yuanboot/blob/master/README_En.md)

yuanboot  简单、轻量、快速，基于声明式依赖注入的微服务框架，告别Java的臃肿架构

* 文档： https://yuanboot.star2cloud.com

![Release](https://img.shields.io/github/v/tag/liangboceo/yuanboot.svg?color=24B898&label=release&logo=github&sort=semver)
![Go](https://github.com/liangboceo/yuanboot/workflows/Go/badge.svg)
![GoVersion](https://img.shields.io/github/go-mod/go-version/liangboceo/yuanboot)
[![Report](https://goreportcard.com/badge/github.com/liangboceo/yuanboot)](https://goreportcard.com/report/github.com/liangboceo/yuanboot)
[![Documentation](https://img.shields.io/badge/godoc-reference-blue.svg?color=24B898&logo=go&logoColor=ffffff)](https://godoc.org/github.com/liangboceo/yuanboot)
![Contributors](https://img.shields.io/github/contributors/liangboceo/yuanboot.svg)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

# yuanboot 特色
- 漂亮又快速的路由器 & MVC 模式 .
- 丰富的中间件支持 (handler func & custom middleware) .
- 微服务框架抽象了分层，在一个框架体系兼容各种server实现，如 rest,grpc等 .
- 充分运用依赖注入DI，管理运行时生命周期，为框架提供了强大的扩展性 .
- 功能强大的微服务集成能力 (Nacos, Eureka, Consul, ETCD) .
- 受到许多出色的 Go Web 框架的启发，并实现了多种 server : **fasthttp** 和 **net.http** 和 **grpc** .

![framework desgin](https://yuanboot.star2cloud.com/images/framework-desgin.jpg)



# 框架安装
```bash
go get github.com/liangboceo/yuanboot
```
# 安装依赖 (由于某些原因国内下载不了依赖)
##  go version < 1.13
```bash
window 下在 cmd 中执行：
set GO111MODULE=on
set GOPROXY=https://goproxy.cn,direct
linux  下执行：
export GO111MODULE=on
export GOPROXY=https://goproxy.cn,direct
```
##  go version >= 1.13
```
go env -w GOPROXY=https://goproxy.cn,direct
```
### vendor
```
go mod vendor       // 将依赖包拷贝到项目目录中去
```
# 简单的例子
```go
package main
import ...

func main() {
	WebApplication.CreateDefaultBuilder(func(rb router.IRouterBuilder) {
        rb.GET("/info",func (ctx *context.HttpContext) {    // 支持Group方式
            ctx.JSON(200, context.H{"info": "ok"})
        })
    }).Build().Run()       //默认端口号 :8080
}
```
![](https://yuanboot.star2cloud.com/images/starup.png)

# 实现进度
## 标准功能
* [☑️] 打印Logo和日志（yuanboot）
* [️☑️] 统一程序输入参数和环境变量 (yuanboot)
* [☑️] 简单路由器绑定句柄功能
* [☑️] HttpContext 上下文封装(请求，响应)
* [☑️] 静态文件端点（静态文件服务器）
* [☑️] JSON 序列化结构（Context.H）
* [☑️] 获取请求文件并保存
* [☑️] 获取请求数据（form-data，x-www-form-urlencoded，Json ，XML，Protobuf 等）
* [☑️] Http 请求的绑定模型（Url, From，JSON，XML，Protobuf）
### 响应渲染功能
* [☑️] Render Interface
* [☑️] JSON Render
* [☑️] JSONP Render
* [☑️] Indented Json Render
* [☑️] Secure Json Render
* [☑️] Ascii Json Render
* [☑️] Pure Json Render
* [☑️] Binary Data Render
* [☑️] TEXT
* [☑️] Protobuf
* [☑️] MessagePack
* [☑️] XML
* [☑️] YAML
* [☑️] File
* [☑️] Image
* [☑️] Template
* [☑️] Auto formater Render

## 中间件
* [☑️] Logger
* [☑️] StaticFile
* [☑️] Router Middleware
* [☑️] CORS	
* [☑️] Binding
* [☑️] JWT
* [☑️] RequestId And Tracker for SkyWorking

## 路由
* [☑️] GET，POST，HEAD，PUT，DELETE 方法支持
* [☑️] 路由解析树与表达式支持
* [☑️] RouteData路由数据 (/api/:version/) 与 Binding的集成 
* [☑️] 路由组功能
* [☑️] MVC默认模板功能
* [☑️] 路由过滤器 Filter

## MVC
* [☑️] 路由请求触发Controller&Action
* [☑️] Action方法参数绑定
* [☑️] 内部对象的DI化
* [☑️] 关键对象的参数传递

## Dependency injection
* [☑️] 抽象集成第三方DI框架
* [☑️] MVC模式集成
* [☑️] 框架级的DI支持功能

## 扩展
* [☑️] 配置
* [☑️] WebSocket
* [☑️] JWT 
* [☑️] swagger
* [☑️] GRpc	 
* [☑️] Prometheus 