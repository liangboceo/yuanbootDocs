# AI 辅助编程指南

yuanboot 框架的**声明式开发模式**天然支持 AI 辅助编程，让 AI 助手能够准确理解代码结构并提供精准的代码补全和生成。

## 核心优势

### 🤖 AI 友好的设计原则

yuanboot 框架在设计时遵循以下 AI 友好原则：

| 设计原则 | 说明 | AI 价值 |
|---------|------|---------|
| **声明式配置** | 使用 YAML 和结构体标签定义行为 | AI 能准确理解配置意图 |
| **明确的类型** | 强类型系统，清晰的接口定义 | AI 能推断正确的使用方式 |
| **结构化代码** | 遵循 MVC 模式，分层清晰 | AI 能理解代码组织结构 |
| **约定大于配置** | 默认行为明确，减少歧义 | AI 能准确预测代码行为 |

---

## 声明式依赖注入

### 构造器注入模式

yuanboot 使用构造器注入，让依赖关系**显式化**：

```go
// ✅ AI 友好：明确的依赖声明
type UserController struct {
    *mvc.ApiController
    userService services.IUserService  // 明确的依赖
    emailService services.IEmailService // 明确的依赖
}

// 构造器注入
func NewUserController(
    userService services.IUserService,
    emailService services.IEmailService,
) *UserController {
    return &UserController{
        ApiController: mvc.NewApiController(),
        userService:   userService,
        emailService:  emailService,
    }
}
```

### 服务注册

```go
ConfigureServices(func(sc *dependencyinjection.ServiceCollection) {
    // 声明式服务注册
    sc.AddTransientByImplements(
        services.NewUserService,
        new(services.IUserService),
    )
})
```

**AI 理解路径**：AI 可以追踪依赖链，理解 `UserController` → `UserService` → `UserRepository` 的完整调用链。

---

## 声明式路由与 API 定义

### RESTful 路由

```go
// 清晰的路由定义
rb.GET("/users", userHandler)
rb.POST("/users", createUserHandler)
rb.GET("/users/:id", getUserHandler)
rb.PUT("/users/:id", updateUserHandler)
rb.DELETE("/users/:id", deleteUserHandler)
```

### 路由组

```go
// 结构化的路由组
rb.Group("/api/v1", func(g *router.RouterGroup) {
    g.GET("/users", listHandler)
    g.POST("/users", createHandler)
    g.GET("/users/:id", getHandler)
})
```

---

## 声明式 API 文档

### Swagger 标签

使用 `doc` 标签声明 API 文档：

```go
// 定义请求对象
type CreateUserRequest struct {
    mvc.RequestBody `route:"/api/users" doc:"创建用户"`
    UserName       string `json:"username" doc:"用户名"`
    Password       string `json:"password" doc:"密码(6-20位)"`
    Email          string `json:"email" doc:"邮箱地址"`
    Phone         string `json:"phone" doc:"手机号"`
}

// 定义响应对象
type UserResponse struct {
    Id       int64  `json:"id" doc:"用户ID"`
    UserName string `json:"username" doc:"用户名"`
    Email    string `json:"email" doc:"邮箱"`
    CreateAt string `json:"createAt" doc:"创建时间"`
}
```

### 启用 Swagger 文档

```go
// 注册 Swagger 文档
endpoints.UseSwaggerDoc(rb,
    swagger.Info{
        Title:       "用户管理 API",
        Version:     "v1.0.0",
        Description: "用户管理服务 API 文档",
    },
    func(openapi *swagger.OpenApi) {
        openapi.AddSecurityBearerAuth()
    })
```

---

## 声明式中间件

### 内置中间件

```go
// 声明式使用中间件
app.UseMiddleware(middlewares.NewCORS())           // 跨域
app.UseMiddleware(middlewares.NewRecovery())        // 异常恢复
app.UseMiddleware(middlewares.NewLogger())          // 日志
app.UseMiddleware(middlewares.NewPrometheus())     // 监控
app.UseMiddleware(middlewares.NewPprof())          // 性能分析
```

### 自定义中间件

```go
// 声明式定义中间件
func RequestLogger() func(next func(ctx *context.HttpContext)) func(ctx *context.HttpContext) {
    return func(next func(ctx *context.HttpContext)) func(ctx *context.HttpContext) {
        return func(ctx *context.HttpContext) {
            start := time.Now()
            next(ctx)
            log.Printf("请求耗时: %v", time.Since(start))
        }
    }
}

// 使用
app.UseMiddleware(RequestLogger())
```

---

## 声明式配置

### YAML 配置

```yaml
# 结构化的配置文件
yuanboot:
  app:
    name: userservice
    port: 8080
    profile: dev
    
  datasource:
    db:
      url: tcp(localhost:3306)/mydb
      username: root
      password: password
      pool:
        initCap: 5
        maxCap: 30
        
  servicediscovery:
    nacos:
      enabled: true
      server_addr: localhost:8848
```

### 代码中获取配置

```go
// 类型安全的配置获取
config.GetString("app.name")
config.GetInt("app.port")
config.GetSection("datasource")
```

---

## AI 提示词模板

### 1. 创建 Controller

```
请帮我创建一个 UserController，要求：
- 使用 yuanboot 的 MVC 模式
- 包含增删改查功能
- 使用构造器注入依赖
- 添加 Swagger 文档注释
```

### 2. 创建 Service

```
请帮我创建一个 UserService，要求：
- 实现 IUserService 接口
- 使用构造器注入依赖
- 包含基本的业务逻辑
```

### 3. 添加中间件

```
请帮我添加 JWT 认证中间件，要求：
- 使用 yuanboot 的中间件模式
- 支持 token 验证
- 集成到现有的路由配置中
```

### 4. 创建 gRPC 服务

```
请帮我创建一个 gRPC 用户服务，要求：
- 使用 yuanboot 的 gRPC 框架
- 包含用户查询接口
- 添加拦截器支持
- 支持服务发现
```

### 5. 配置服务发现

```
请帮我配置 Nacos 服务发现，要求：
- 使用 yuanboot 的服务发现模块
- 配置服务注册和健康检查
- 添加到现有的 DI 容器中
```

---

## 代码生成最佳实践

### 1. 使用 CLI 工具生成项目骨架

```bash
# 创建微服务项目
yuanbootctl new microservice -n userservice -p ~/projects

# 创建 gRPC 项目
yuanbootctl new grpc -n userservice -p ~/projects
```

### 2. 利用模板结构

yuanboot 项目模板提供了标准的目录结构：

```
myproject/
├── cmd/
│   └── server/
│       └── main.go
├── config/
│   └── config.yml
├── internal/
│   ├── controller/
│   ├── service/
│   └── model/
├── api/
│   └── proto/
└── go.mod
```

### 3. 遵循约定

- **命名约定**: 使用驼峰命名法
- **目录结构**: 遵循标准项目布局
- **错误处理**: 使用统一的错误响应格式

---

## AI 辅助开发工作流

### 阶段一：项目初始化

```bash
# 1. 使用 CLI 创建项目
yuanbootctl new microservice -n myservice -p ~/projects

# 2. AI 辅助完善项目结构
# 提示词：帮我完善这个微服务项目，添加标准的模块结构
```

### 阶段二：功能开发

```bash
# 1. 定义 API 规范
# 提示词：帮我创建用户相关的 API 定义，包含请求和响应结构

# 2. 实现 Controller
# 提示词：基于上述 API 定义，创建 UserController

# 3. 实现 Service
# 提示词：创建 UserService，实现业务逻辑
```

### 阶段三：集成配置

```bash
# 1. 配置中间件
# 提示词：帮我添加 JWT 认证、CORS、日志等中间件

# 2. 配置服务发现
# 提示词：帮我配置 Nacos 服务发现

# 3. 配置监控
# 提示词：帮我添加 Prometheus 监控指标
```

### 阶段四：测试与部署

```bash
# 1. 生成测试用例
# 提示词：帮我为 UserService 生成单元测试

# 2. 配置 Docker
# 提示词：帮我创建 Dockerfile 和 docker-compose.yml
```

---

## 框架内置的 AI 辅助能力

### 1. 自动参数绑定

```go
// AI 只需理解请求结构，框架自动处理绑定
func (c *UserController) GetUser(
    ctx *context.HttpContext,
    req *GetUserRequest,
) mvc.ApiResult {
    // req 已自动绑定，AI 可以直接使用
    user := c.userService.GetById(req.Id)
    return c.OK(user)
}

type GetUserRequest struct {
    mvc.RequestGET `route:"/api/users/:id"`
    Id            int64 `param:"id"`
}
```

### 2. 自动 Swagger 文档

```go
// 使用 doc 标签，AI 可以理解 API 契约
type CreateOrderRequest struct {
    mvc.RequestBody `route:"/api/orders" doc:"创建订单"`
    ProductId      int64  `json:"productId" doc:"商品ID"`
    Quantity       int    `json:"quantity" doc:"购买数量"`
}
```

### 3. 自动错误处理

```go
// AI 只需返回数据，框架自动处理错误响应
func (c *UserController) GetUser(req *GetUserRequest) mvc.ApiResult {
    user, err := c.userService.GetById(req.Id)
    if err != nil {
        return c.Error(err) // 框架自动转换为标准错误响应
    }
    return c.OK(user)
}
```

---

## 相关资源

- [CLI 工具文档](./tools/cli.md)
- [框架规格文档](./tools/spec.md)
- [MVC 控制器](../mvc/Mvc-Controller.md)
- [服务发现](../microservices/)
- [示例项目](https://github.com/liangboceo/yuanboot-examples)

---

## 支持与反馈

- 📧 GitHub Issues: [提交问题](https://github.com/liangboceo/yuanboot/issues)
- 💬 讨论组: [Discord](https://discord.gg/yuanboot)
- 📖 官方文档: [yuanboot Docs](https://yuanboot.star2cloud.com)
