# 框架开发指南

从创建项目到部署服务，可按以下顺序阅读：

1. [快速上手](quickstart.md)：安装框架，创建和运行第一个项目。
2. [基本概念与架构](architecture.md)：理解宿主、应用构建器、路由和生命周期。
3. [代码展示](examples.md)：实现请求模型、业务服务和接口。
4. [配置文件与多环境](configuration.md)：管理 dev、fat、uat、pro 配置。
5. [服务路由](web.md)与 [MVC](mvc.md)：组织 API、控制器和页面。
6. [依赖注入](dependency-injection.md)：选择服务生命周期，管理资源。
7. [组件配置与使用](components.md)：接入数据库、缓存、配置中心和服务发现。
8. [日志与可观测性](observability.md)：检查健康状态，采集日志和指标。
9. [Docker 部署](deployment/docker.md)或[宿主机部署](deployment/host.md)：运行和更新业务服务。

需要后台任务时参考 [Console 与后台服务](hosting.md)，
需要 RPC 时参考 [gRPC 服务](grpc.md)。
