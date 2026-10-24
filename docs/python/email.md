# 邮件服务

yuanboot Python 提供 SMTP 客户端，支持文本、HTML、附件以及 STARTTLS / SSL。应用需要准备可访问的 SMTP 服务和发送账号。

## 配置 SMTP

在项目 `config.yml` 中添加：

```yaml
yuanboot:
  email:
    host: "${SMTP_HOST}"
    port: 587
    username: "${SMTP_USERNAME}"
    password: "${SMTP_PASSWORD}"
    starttls: true
    ssl: false
    timeout: 10
mail:
  sender: "${SMTP_SENDER}"
```

587 端口通常使用 STARTTLS；465 端口通常配置 `ssl: true`、`starttls: false`。两种 TLS 方式不能同时启用，具体以邮件服务商要求为准。

构建宿主时调用 `use_components()` 会按邮件配置注册 `SmtpClient`；也可显式调用 `use_email()`：

```python
from yuanboot import ConfigurationBuilder
from yuanboot.web import WebHostBuilder

configuration = ConfigurationBuilder().add_yaml_file().add_environment().build()
builder = WebHostBuilder(configuration).use_email()
# 继续注册 Startup / 业务服务和路由，再调用 builder.build()。
```

## 注入业务服务

在业务服务中通过构造器注入 `SmtpClient` 与 `Configuration`：

```python
from yuanboot import Configuration
from yuanboot.components.email import SmtpClient


class NotificationService:
    def __init__(self, smtp: SmtpClient, configuration: Configuration):
        self.smtp = smtp
        self.sender = configuration.get_string("mail.sender")

    def send_order_created(self, recipient: str, order_id: str):
        return self.smtp.send(
            sender=self.sender,
            recipients=[recipient],
            subject=f"订单 {order_id} 已创建",
            body=f"您的订单 {order_id} 已创建成功。",
        )
```

在 `Startup.configure_services` 中注册 `services.add_scoped(NotificationService)`，再向控制器注入该服务。
`send` 为同步调用，适合普通 `def` 动作或后台工作线程；从异步动作调用时可使用 `await asyncio.to_thread(service.send_order_created, recipient, order_id)`。

## HTML 与附件

以下代码在已注入 `SmtpClient` 的业务方法中使用：

```python
self.smtp.send(
    sender=self.sender,
    recipients=["customer@example.com"],
    subject="订单明细",
    body="<p>订单已创建，明细请见附件。</p>",
    html=True,
    attachments={"order.txt": "订单明细".encode("utf-8")},
)
```

`recipients` 支持地址列表，也支持分号分隔的字符串；附件为文件名到字节内容的字典。
发送失败会抛出异常，业务应记录失败并根据需要重试。返回值为 SMTP 拒收地址信息，空字典表示 SMTP 服务接受了全部收件人，不代表邮件已送达收件箱。

需要定时发送或把发送从接口响应中移出时，可结合[后台服务](hosting.md)；需要跨进程可靠投递时，由业务队列或任务表保存待发送消息。
