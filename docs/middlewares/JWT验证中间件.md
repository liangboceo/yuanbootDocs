## 配置节点
在**application.server.jwt** 节点下，配置如下
```yaml
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
      skip_path: [
          "/info",
          "/v1/user/GetInfo"
      ]
```

## 配置说明
1. **header**    设置要获取jwt的http头信息
2. **secret**    生成token的密钥
3. **prefix**    http头信息中token的前缀，比如 Bearer eyJhbGciOiJIUzI1NiIsIn......... , Bearer就是prefix.
4. **expires**   获取**token**的过期时间为**int64**类型，**单位**为**小时**.
5. **enable**    设置jwt验证是否启用 false 则不进行jwt信息验证.
6. **skip_path** 是要跳过验证的路由数组.