const path = require('path')

const golangNav = [
  { text: '首页', link: '/' },
  { text: '文档', link: '/quickstart/begin.html' },
  { text: 'AI 辅助编程', link: '/ai-assist.html' },
  { text: '源码', link: 'https://github.com/liangboceo/yuanboot' }
]

const pythonNav = [
  { text: '首页', link: '/python/' },
  { text: '文档', link: '/python/quickstart.html' },
  { text: 'AI 辅助编程', link: '/python/ai-assist.html' },
  { text: '源码', link: 'https://github.com/liangboceo/yuanboot-python' }
]

module.exports = {
    title: 'yuanboot - AI Native 微服务框架，简单、轻量、快速，告别Java的臃肿架构',
    description: '简单、轻量、快速，基于声明式依赖注入的微服务框架。AI Native 开发体验，声明式 API Spec 规范，让 AI 助手准确理解代码',
    base : '/',
    theme: 'default-prefers-color-scheme',
    plugins: [path.resolve(__dirname, 'plugins/active-header-links')],
    chainWebpack (config) {
      config.resolve.alias.set(
        '@theme/components/NavLinks.vue',
        path.resolve(__dirname, 'components/FrameworkNavLinks.vue')
      )
      config.resolve.alias.set(
        '@theme/components/Navbar.vue',
        path.resolve(__dirname, 'components/FrameworkNavbar.vue')
      )
      const parentTheme = config.resolve.alias.get('@parent-theme')
      config.resolve.alias.delete('@parent-theme')
      config.resolve.alias.set(
        '@parent-theme/layouts/Layout.vue',
        path.resolve(__dirname, 'components/FrameworkLayout.vue')
      )
      config.resolve.alias.set('@parent-theme', parentTheme)
    },
    markdown: {
      lineNumbers: false // 代码块显示行号
    },
     head: [
      ['meta', {description:'简单、轻量、快速，基于声明式依赖注入的微服务框架。AI Native 开发体验，声明式 API Spec 规范，让 AI 助手准确理解代码'}],
      ['link', { rel: 'icon', href: 'https://yuanboot.star2cloud.com/images/logo.png' }],
      ['script', {}, `
              var _hmt = _hmt || [];
              `
      ]
    ],
    themeConfig : {
      logo: 'https://yuanboot.star2cloud.com/images/logo.png',
      // Local scroll behavior keeps smooth anchor links without animating page changes.
      smoothScroll: false,
      activeHeaderLinks: false,
      repo: 'https://github.com/liangboceo/yuanboot',
      repoLabel: 'GitHub',
      overrideTheme: 'dark',
      frameworks: {
        golang: { label: 'Golang', repo: 'https://github.com/liangboceo/yuanboot', nav: golangNav },
        python: { label: 'Python', repo: 'https://github.com/liangboceo/yuanboot-python', nav: pythonNav }
      },
      sidebar: {
        '/python/': [
          ['quickstart.md', '快速预览'],
          ['architecture.md', '基本概念'],
          ['examples.md', '代码展示'],
          ['admin.md', '管理后台模板'],
          {
            title: '服务配置',
            collapsable: true,
            children: [
              ['configuration.md', '配置文件与多环境'],
              ['components.md', '组件配置与使用']
            ]
          },
          {
            title: 'Web Hosting',
            collapsable: true,
            children: [
              ['web.md', '服务路由'],
              ['web.md#静态文件与视图', '静态资源绑定'],
              ['web.md#jwt-鉴权', 'JWT'],
              ['observability.md', '健康检查'],
              {
                title: 'MVC模式',
                collapsable: true,
                children: [
                  ['mvc.md', 'MVC控制器'],
                  ['mvc.md#渲染视图', 'MVC视图']
                ]
              },
              {
                title: '可观察性',
                collapsable: true,
                children: [
                  ['observability.md', '健康检查与依赖检查'],
                  ['observability.md#prometheus-采集', 'Prometheus集成']
                ]
              },
              {
                title: '中间件',
                collapsable: true,
                children: [
                  ['web.md#cors-与中间件', '自定义中间件与跨域'],
                  ['web.md#jwt-鉴权', 'JWT验证'],
                  ['observability.md#请求追踪', 'RequestID']
                ]
              }
            ]
          },
          {
            title: 'gRPC Hosting',
            collapsable: true,
            children: [['grpc.md', '开始']]
          },
          {
            title: 'Console Hosting',
            collapsable: true,
            children: [
              ['hosting.md', 'console'],
              ['components.md#grpc-与-xxl-job', 'xxl-job']
            ]
          },
          {
            title: '微服务-服务发现',
            collapsable: true,
            children: [
              ['service-discovery.md#etcd', 'Etcd'],
              ['service-discovery.md#nacos', 'Nacos'],
              ['service-discovery.md#consul', 'Consul'],
              ['service-discovery.md#eureka', 'Eureka']
            ]
          },
          {
            title: '高级特性',
            collapsable: true,
            children: [
              ['dependency-injection.md', '依赖注入'],
              ['hosting.md', '扩展点 - HostedService'],
              ['versions.md', '版本与安装']
            ]
          },
          ['observability.md#日志配置', '服务日志'],
          {
            title: 'AI 辅助编程',
            collapsable: true,
            children: [
              ['ai-assist.md', 'AI 辅助编程指南'],
              ['cli.md', 'Python CLI 工具'],
              ['spec.md', '框架规格文档'],
              ['email.md', '邮件服务']
            ]
          },
          {
            title: '部署方式',
            collapsable: true,
            children: [
              ['deployment/docker.md', 'Docker 部署'],
              ['deployment/host.md', '宿主机部署']
            ]
          }
        ],
        '/': [
        ['/quickstart/begin.md','快速预览'],
        ['/quickstart/yuanboot微服务框架入门系列-基础入门--基本概念.md','基本概念'],
        ['/quickstart/Advanced-Example.md','代码展示'],
       
        {
            title: '服务配置',
            collapsable: true,
            children: [
                { title: '配置文件', path:'/configs/配置文件.md'},
                { title: '配置对象DSL', path:'/configs/配置对象与DSL.md'},
                { title: '启动参数', path:'/configs/启动参数与环境变量.md'},
                { title: 'Nacos集成', path:'/configs/nacos集成.md'},
                { title: 'Nacos与Viper', path:'/configs/nacos-viper.md'},
            ]
        },
        {
          title: 'Web Hosting',
          collapsable: true,
          children: [
              { title: '服务路由', path:'/web/Server-path.md'},
              { title: '静态资源绑定', path:'/web/静态资源绑定.md'},

              { title: 'JWT', path:'/web/JWT-Endpoint.md'},
              { title: '健康检查', path:'/web/健康检查.md'},
              { 
                title: 'MVC模式',
                collapsable: true,
                children: [
                  { title: 'MVC控制器', path:'/mvc/Mvc-Controller.md'},
                  { title: 'MVC视图', path:'/mvc/View视图.md'},
                  { title: 'MVC过滤器', path:'/mvc/ActionFilter.md'},
                ]
              },
              { 
                title: '可观察性',
                collapsable: true,
                children: [
                  { title: '可观察性-健康检查', path:'/web/健康检查.md'},
                  { title: '可观察性-依赖检查', path:'/web/依赖检查.md'},
                  { title: '可观察性-pprof', path:'/web/pprof.md'},
                  { title: '可观察性-Prometheus', path:'/web/Prometheus集成.md'},
                ]
              },
              { 
                title: '中间件',
                collapsable: true,
                children: [
                  { title: '自定义中间件', path:'/middlewares/自定义中间件.md'},
                  { title: '跨域中间件', path:'/middlewares/跨域中间件.md'},
                  { title: 'JWT验证中间件', path:'/middlewares/JWT验证中间件.md'},
                  { title: 'RequestID中间件', path:'/middlewares/RequestID中间件.md'},
                ]
              },
             
          ]
        },
        {
          title: 'gRPC Hosting',
          collapsable: true,
          children: [
              { title: '开始', path:'/grpc/help.md'}
          ]
        },
        {
          title: 'Console Hosting',
          collapsable: true,
          children: [
            { title: 'console', path:'/console/help.md'},
            { title: 'xxl-job', path:'/console/xxl-job.md'},
          ]
        },
        {
          title: '微服务-服务发现',
          collapsable: true,
          children: [
              { title: 'Etcd', path:'/microservices/naming_etcd.md'},
              { title: 'Nacos', path:'/microservices/ms-service-discovery.md'},
              { title: 'Consul', path:'/microservices/naming_consul.md'},
              { title: 'Eureka', path:'/microservices/naming_eureka.md'},
          ]
        },
        {
          title: '高级特性',
          collapsable: true,
          children: [
              { title: '依赖注入 - dependencyinjection', path:'/extendpoint/di.md'},
              { title: '扩展点 - HostService接口', path:'/extendpoint/hostservice.md'},
          ]
        },
        ['/logs/日志.md','服务日志'],
        {
          title: 'AI 辅助编程',
          collapsable: true,
          children: [
              { title: 'AI 辅助编程指南', path:'/ai-assist.md'},
              { title: 'yuanbootctl CLI', path:'/tools/cli.md'},
              { title: '框架规格文档', path:'/tools/spec.md'},
              { title: '邮件服务', path:'/tools/email.md'},
          ]
        },
        {
          title: '部署方式',
          collapsable: true,
          children: [
              { title: 'Docker 部署', path:'/deployment/docker.md'},
              { title: '宿主机部署', path:'/deployment/host.md'},
          ]
        },
        ]
      },
      nav: golangNav,

    }
  }
