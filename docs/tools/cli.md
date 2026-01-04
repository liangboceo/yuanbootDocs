## install
```bash
go install github.com/liangboceo/yuanboot/cli/yuanbootctl@latest
```

## local install
```bash
cd yuanboot/cli/yuanbootctl
go install
```

# Installation location:
$GOPATH

add $GOPATH to $PATH Environment variable

# Commands
There are commands working with application root folder
## new 
```bash
yuanbootctl new <TEMPLATE> [-l|--list] [-n <PROJECTNAME>] [-p <TARGETDIR>]
```
### --list
list all templates
#### TEMPLATE LIST 模板列表
iot / console / webapi / mvc / grpc / xxl-job
##### iot 物联网模板
##### console 控制台程序
##### webapi api接口程序
##### mvc 标准的mvc程序
##### grpc grpc服务
##### xxl-job xxl-job服务
### -n 
generate folder by project name `<PROJECTNAME>`

### -p `<TARGETDIR>`
output files to target directory. 

## such as 
```bash
yuanbootctl new console -n demo -p /Projects
```

## add (Not realized)
add code snippet to the file, filepath was for default settings.
```bash
yuanbootctl add <SNIPPET> [-l|--list] [-f|--file <filepath>]
```
#### SNIPPET LIST
dockerfile / config / controller / job-handler / hostservice / startup / web-middleware / web-filter / grpc-interceptor

## build
build current working directory
```bash
yuanbootctl build
```

## run
running current working directory app
```bash
yuanbootctl run
```

## version
display yuanboot version
```bash
yuanbootctl version
```

