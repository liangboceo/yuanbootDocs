# yuanbootctl CLI 工具

yuanbootctl 是 yuanboot 框架的官方命令行工具，用于快速生成项目骨架和管理微服务项目。

## 安装

### 在线安装
```bash
go install github.com/liangboceo/yuanboot/cli/yuanbootctl@latest
```

### 本地安装
```bash
cd yuanboot/cli/yuanbootctl
go install
```

> 安装位置: `$GOPATH/bin`
> 确保 `$GOPATH/bin` 已添加到 `$PATH` 环境变量

---

## 命令概览

| 命令 | 说明 |
|------|------|
| `yuanbootctl new` | 从模板创建新项目 |
| `yuanbootctl build` | 构建当前目录项目 |
| `yuanbootctl run` | 运行当前目录项目 |
| `yuanbootctl version` | 显示版本信息 |

---

## new - 创建新项目

从预定义模板快速创建 yuanboot 项目。

### 基本用法
```bash
yuanbootctl new <TEMPLATE> [-n <PROJECTNAME>] [-p <TARGETDIR>]
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `<TEMPLATE>` | 模板名称（必填） |
| `-n, --projectName` | 项目名称，默认 `demo` |
| `-p, --path` | 输出目录路径 |
| `-l, --templates` | 列出所有可用模板 |

### 可用模板

| 模板 | 说明 | 适用场景 |
|------|------|----------|
| `console` | 控制台程序 | 后台任务、定时任务 |
| `webapi` | API 接口程序 | RESTful API 服务 |
| `mvc` | 标准 MVC 程序 | 传统 Web 应用 |
| `grpc` | gRPC 服务 | 高性能 RPC 服务 |
| `xxl-job` | 分布式任务调度 | 定时任务管理 |
| `iot` | 物联网程序 | IoT 设备接入 |
| `simpleweb` | 简单 Web 应用 | 快速原型开发 |
| `microservice` | 微服务项目 | 微服务架构项目 |

### 示例

```bash
# 列出所有模板
yuanbootctl new -l

# 创建控制台项目
yuanbootctl new console -n myconsole -p ~/projects

# 创建 Web API 项目
yuanbootctl new webapi -n myapi -p ~/projects

# 创建 gRPC 项目
yuanbootctl new grpc -n mygrpc -p ~/projects

# 创建微服务项目
yuanbootctl new microservice -n myservice -p ~/projects
```

---

## build - 构建项目

构建当前工作目录下的 yuanboot 项目。

```bash
yuanbootctl build
```

### 示例
```bash
cd ~/projects/myapi
yuanbootctl build
```

---

## run - 运行项目

运行当前工作目录下的 yuanboot 项目。

```bash
yuanbootctl run
```

### 示例
```bash
cd ~/projects/myapi
yuanbootctl run
```

---

## version - 版本信息

显示 yuanbootctl 和 yuanboot 框架的版本信息。

```bash
yuanbootctl version
```

### 输出示例
```
:: yuanbootctl ::   (version: 1.9.x)
```

---

## spec - API 规范系统

yuanboot 内置 API Spec 规范系统，为 AI 辅助编程提供清晰的代码上下文。

### 功能特性

- **声明式 API 定义**: 使用结构体标签定义 API 元数据
- **自动生成文档**: 从代码注释和标签自动生成 API 文档
- **多协议支持**: 支持 REST API 和 gRPC
- **AI 友好**: 清晰的代码结构让 AI 助手能够准确理解

### Swagger 文档集成

yuanboot 支持通过 `doc` 标签自动生成 Swagger 文档：

```go
// 使用 doc 标签标注字段说明
type CreateUserRequest struct {
    mvc.RequestBody `route:"/api/users" doc:"创建用户"`
    UserName       string `json:"username" doc:"用户名"`
    Password       string `json:"password" doc:"密码"`
    Email          string `json:"email" doc:"邮箱"`
}

// 启用 Swagger 文档
endpoints.UseSwaggerDoc(rb,
    swagger.Info{
        Title:       "API 文档",
        Version:     "v1.0.0",
        Description: "API 描述文档",
    },
    func(openapi *swagger.OpenApi) {
        openapi.AddSecurityBearerAuth()
    })
```

### 生成 OpenAPI 规范

```bash
# 查看内置的 yuanboot 框架规格文档
cat yuanboot/cli/yuanbootctl/spec/spec/yuanboot.md
```

---

## AI 辅助编程指南

yuanboot 的声明式开发模式天然支持 AI 辅助编程：

### 1. 清晰的代码结构

```go
// ✅ AI 友好的代码：明确的类型和结构
type UserController struct {
    *mvc.ApiController
    userService services.IUserService // 明确的依赖声明
}

// ❌ AI 难以理解的代码：隐式依赖
var userService *UserService
```

### 2. 声明式路由定义

```go
// 清晰的路由定义
rb.GET("/users/:id", userHandler)
rb.POST("/users", createUserHandler)

// AI 可以准确理解路由结构
```

### 3. 结构化的配置

```yaml
# 结构化的 YAML 配置
yuanboot:
  app:
    name: myapp
    port: 8080
  datasource:
    db:
      url: tcp(localhost:3306)/mydb
```

### 4. 提示工程建议

当使用 AI 助手编程时，可以参考以下提示词模板：

```
你是一个 yuanboot 框架专家。请帮我：
1. 创建一个用户管理 Controller
2. 使用 yuanboot 的 MVC 模式
3. 包含基本的增删改查功能
4. 添加 JWT 认证
```

---

## 最佳实践

### 1. 使用模板快速启动
```bash
# 使用模板创建项目，而不是从头开始
yuanbootctl new grpc -n myservice -p ~/projects
```

### 2. 利用结构化标签
```go
// 使用 doc 标签提供清晰的文档
type OrderRequest struct {
    mvc.RequestBody `route:"/api/orders" doc:"创建订单"`
    ProductId      int64  `json:"productId" doc:"商品ID"`
    Quantity       int    `json:"quantity" doc:"数量"`
}
```

### 3. 遵循约定大于配置
- 使用标准的目录结构
- 遵循命名约定
- 利用框架默认行为

### 4. 版本控制
```bash
# 提交代码
git add .
git commit -m "feat: 添加用户管理功能"
```

---

## 常见问题

### Q: 命令找不到？
```bash
# 检查是否安装成功
which yuanbootctl

# 检查 GOPATH
echo $GOPATH

# 确认 PATH 包含 GOPATH/bin
export PATH=$PATH:$GOPATH/bin
```

### Q: 模板创建失败？
```bash
# 检查 Go 环境
go version

# 清理模块缓存
go clean -modcache

# 重新安装
go install github.com/liangboceo/yuanboot/cli/yuanbootctl@latest
```

### Q: 构建失败？
```bash
# 确保在项目根目录
cd ~/projects/myapi

# 初始化 Go 模块
go mod init

# 下载依赖
go mod tidy
```

---

## 相关资源

- [yuanboot 框架源码](https://github.com/liangboceo/yuanboot)
- [示例项目](https://github.com/liangboceo/yuanboot-examples)
- [框架规格文档](./spec/yuanboot.md)
