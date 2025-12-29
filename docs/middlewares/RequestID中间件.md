## RequestID 中间件
RequestID 中间件会为Response Header http信息头添加UUID，header key: "X-Request-ID"
```go
yuanboot.NewWebHostBuilder().
	 UseConfiguration(configuration).
	 Configure(func(app *yuanboot.WebApplicationBuilder) {
                 app.UseMiddleware(Middleware.NewRequestID())
         }
}
```