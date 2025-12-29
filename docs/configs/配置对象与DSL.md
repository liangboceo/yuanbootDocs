## Features
1. Get config value for DSL, that support key or ref object.

### Such as YAML:
```yaml
env: ${CUSTOM_ENV}
profile:
  dns: ${REMOTE_HOST}
  ip: ${REMOTE_IP:10.0.1.12}
  namespace: ${MYNAMESPACE:space.localhost}
```

### Go Example
```go
type Profile struct {
	DNS string `config:"dns"`
	IP  string `config:"ip"`
	NS  string `config:"namespace"`
}

config := abstractions.NewConfigurationBuilder().
       AddEnvironment().
       AddYamlFile("config").Build()

config.GetConfigObject("profile", &profile)
assert.Equal(t, profile.NS, "space.yuanboot.run")
assert.Equal(t, profile.DNS, "my host")
assert.Equal(t, profile.IP, "10.0.1.12")
```
or

```go
env := config.Get("env")
dns := config.Get("profile.dns")
ip := config.Get("profile.ip")

assert.Equal(t, env, "my env variable")
assert.Equal(t, dns, "my host")
assert.Equal(t, ip, "10.0.1.12")
```