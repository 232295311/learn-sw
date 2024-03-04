本项目来自本人博客：[【实战】ServiceWorker实现离线缓存](http://120.25.166.245/index.php/archives/15/)

你可在此体验[Demo](https://232295311.github.io/learn-sw/app.html)（记得打开Chrome开发者工具）

## 摘要：

### 什么是Service Worker?

众所周知， js 是被设计为单线程语言，因为主要用途是与用户互动和操作 `DOM`，单线程设计可以简化并发问题，避免多线程并发时的竞态条件、死锁和其他问题。但单线程存在的问题是，**GUI线程**和**js线程**需要抢占资源，在 js 执行比较耗时的逻辑时，容易造成页面假死，用户体验较差。后来 `html5`开放了 `Web Worker`可以在浏览器后台挂载新线程。它无法直接操作 `DOM`，无法访问 `window`、`document`等对象。而 `Service Worker`可以说是 `Web Worker`进一步发展后的产物。**`SW`也是运行在浏览器背后的独立线程，**主要用于代理网页请求，可缓存请求结果；可实现离线缓存功能。也拥有单独的作用域范围和运行环境
![浏览器进程.jpg][3]

### Service Worker的特点

在 `Service Worker`诞生之前，`Web Worker`就已经“服役”很久了，他们都是独立于js线程外的线程，但是 `Web Worker`有个特点就是：当网页关闭时，`Web Worker`就失效了，而 `Service Worker`的诞生就是为了解决这个问题的，它具有以下特点：

1. 一旦被 `install`，就永远存在，除非被手动 `unregister`。
2. 拥有自己独立的**worker线程**，独立于当前网页进程，有自己独立的**worker上下文**(context)。
3. 用到的时候就可以直接唤醒，不用的时候自动睡眠。
4. 可拦截代理 `fetch`请求和响应，不支持 `xmlHttpRequest`请求。
5. 可操作缓存文件，且缓存文件可以被网页进程取到（包括网路离线状态）。
6. 能向客户推送消息。
7. 不能直接操作 `DOM`、`window`、`parent`等 。（但是它有自己的**`self`**对象来代替 `window`）
8. 必须在 `HTTPS`环境下才能工作。(本地调试可以用 `localhost`)
9. 异步实现，内部大都是通过 `Promise`实现，以防止浏览器卡顿。**所以 `Service Worker`的各类操作都被设计为异步**，我们在调用的时候要**使用 `Promise`语法**。

### Service Worker的生命周期

当我们注册了 `Service Worker`后，它会经历生命周期的各个阶段，同时会触发相应的事件。整个生命周期包括了：`installing` --> `installed` --> `activating` --> `activated` --> `redundant`。当 `Service Worker`**installed**完毕后，会触发**`install`**事件；而**activated**完毕后，则会触发** `activate`**事件。
![生命周期.jpg][4]

`Service Worker`同时提供了事件监听函数对这些状态进行捕获，例如：

```
self.addEventListener('install', function(event) { /* 安装后... */ });
self.addEventListener('activate', function(event) { /* 激活后... */ });

self.addEventListener('fetch', function(event) { /* 请求后... */ }); //用来响应和拦截各种请求。
```

基本上，`Service Worker`的所有应用都是基于上面3个事件的，例如，我们接下来的实战内容。`install`用来缓存文件，`activate`用来缓存更新，`fetch`用来拦截请求直接返回缓存数据。三者齐心，构成了完成的离线缓存控制结构。

。。。。。
