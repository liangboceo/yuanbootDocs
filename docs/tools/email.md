```go
smtpConnection := email.New("smtp.exmail.qq.com", "smtpUser@smtp.exmail.qq.com", "smtpPassword")

res := smtpConnection.SendMail("from@domain.com", errValue, "This is subject", "Hi! <br><br> This is body")

if !strings.Contains(res.Error(), errMessage) {
    t.Errorf("Test failed on Tos: %s", errValue)
}
```