## JWT token 创建终结点
使用**Endpoints.UseJwt** 可以为应用程序创建验证凭证Token.

## 实例
```go
func main() {
	yuanboot.CreateDefaultBuilder(func (rb router.IRouterBuilder) {
	         endpoints.UseJwt(rb)
        }.Build().Run()
}
```
## 配置
创建Token依赖配置节点 **application.server.jwt** 下:
**secret ** , **expires ** 分别用于jwt的密钥和过期时间.
```
application:
  name: demo
  server:
    # ........
    jwt:
      header: "Authorization"
      secret: "12391JdeOW^%$#@"
      prefix: "Bearer"
      expires: 3
      enable: true
```

## 访问地址  
POST: /auth/token

请求参数： 
```json
{ 
   "id":"22" , 
   "name":"yuanboot"  
}
```


## 返回值
```json
{
    "success": true,
    "expires": 1597928060,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTc5MjgwNjAsImlzcyI6InlveW8iLCJ1aWQiOjIyLCJhZG1pbiI6ZmFsc2V9.KSuCDABBjxQuDW9OJI-Jx4AFkXVObJ1sUcDvbpGN54g"
}
```