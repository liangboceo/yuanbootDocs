# 使用Viper读取Nacos配置(开源)

## 一、前言
目前Viper支持的Remote远程读取配置如 etcd, consul；目前还没有对Nacos进行支持，本文中将开源一个Nacos的Viper支持库, 开源地址在文章的最下方.
实现这个仓库的主要目的是为了，最终集成到我们的[yuanboot](https://github.com/liangboceo/yuanboot)框架中。

## 二、什么是Viper
[Viper](github.com/spf13/viper)是适用于Go应用程序的完整配置解决方案。它被设计用于在应用程序中工作，并且可以处理所有类型的配置需求和格式。

### 2.1 它支持以下特性：

* 设置默认值
* 从JSON、TOML、YAML、HCL、envfile和Java properties格式的配置文件读取配置信息
* 实时监控和重新读取配置文件（可选）
* 从环境变量中读取
* 从远程配置系统remote（etcd或Consul）读取并监控配置变化
* 从命令行参数读取配置
* 从buffer读取配置
* 显式配置值

### 2.2 读取本地文件
```go
viper.SetConfigFile("./config.yaml")   // 指定配置文件路径
viper.SetConfigName("config")          // 配置文件名称(无扩展名)
viper.SetConfigType("yaml")            // 如果配置文件的名称中没有扩展名，则需要配置此项
viper.AddConfigPath("/etc/appname/")   // 查找配置文件所在的路径
viper.AddConfigPath("$HOME/.appname")  // 多次调用以添加多个搜索路径
viper.AddConfigPath(".")               // 还可以在工作目录中查找配置
err := viper.ReadInConfig()            // 查找并读取配置文件
if err != nil {                        // 处理读取配置文件的错误
	panic(fmt.Errorf("Fatal error config file: %s \n", err))
}
```

**本篇文章重点着重于remote部分,Nacos的支持.**
## Viper remote 
在Viper中启用远程支持，需要在代码中匿名导入viper/remote这个包。
```go
import _ "github.com/spf13/viper/remote"
```
通过remote,Viper将支持读取从Key/Value存储( 例如etcd或Consul或本文中的Nacos ).
### Viper加载配置值的优先级
**磁盘上的配置文件 > 命令行标志位 > 环境变量 > 远程Key/Value存储 > 默认值** 。

## Nacos 支持
引用我们的开源库 https://github.com/liangboceo/nacos-viper-remote
```go
import (
	"github.com/spf13/viper"
	remote "github.com/liangboceo/nacos-viper-remote"
)
```
在项目中使用:
```go
runtime_viper := viper.New()
// 配置 Viper for Nacos 的远程仓库参数
remote.SetOptions(&remote.Option{
   Url:         "localhost",            // nacos server 多地址需要地址用;号隔开，如 Url: "loc1;loc2;loc3"
   Port:        80,                     // nacos server端口号
   NamespaceId: "public",               // nacos namespace
   GroupName:   "DEFAULT_GROUP",        // nacos group
   Config: 	remote.Config{ DataId: "config_dev" }, // nacos DataID
   Auth:        nil,                    // 如果需要验证登录,需要此参数
})

err := remote_viper.AddRemoteProvider("nacos", "localhost", "")
remote_viper.SetConfigType("yaml")

_ = remote_viper.ReadRemoteConfig()             //sync get remote configs to remote_viper instance memory . for example , remote_viper.GetString(key)
_ = remote_viper.WatchRemoteConfigOnChannel()   //异步监听Nacos中的配置变化，如发生配置更改，会直接同步到 viper实例中。

appName := remote_viper.GetString("key")   // sync get config by key

fmt.Println(appName)

// 这里不是必须的，只为了监控Demo中的配置变化，并打印出来
go func() {
    for {
        time.Sleep(time.Second * 30) // 每30秒检查配置是否发生变化 
        appName = config_viper.GetString("yuanboot.application.name")
        fmt.Println(appName)
    }
}()

```


## 最后
实现这个仓库的主要目的是为了，最终集成到我们的yuanboot框架中。

### 本文提及的开源库地址： 
### nacos-viper-remote
https://github.com/liangboceo/nacos-viper-remote
### yuanboot
https://github.com/liangboceo/yuanboot

🦄🌈 yuanboot is a simple, light and fast , dependency injection based micro-service framework written in Go. Support Nacos ,Consoul ,Etcd ,Eureka ,kubernetes.