// 定义缓存空间名称
const CACHE_NAME = "tuland-1"; //修改此值可以强制更新缓存
// 定义需要缓存的文件目录
const FILE_TO_CACHE = [
  "./app.html",
  "./src/index.js",
  "./assets/css/style.css",
  "./assets/images/background1.jpg",
  "./assets/images/background2.jpg",
];

// 监听install事件，回调中缓存所需文件
self.addEventListener("install", (e) => {
  console.log("Service Worker 状态： instal");
  self.skipWaiting(); // 强制更新sw.js
  e.waitUntil(
    // cacheStorage API 可直接用caches来替代
    // open方法创建/打开缓存空间，并会返回promise实例
    // then来接收返回的cache对象索引
    caches.open(CACHE_NAME).then(function (cache) {
      // cache对象addAll方法解析（同fetch）并缓存所有的文件
      return cache.addAll(FILE_TO_CACHE);
    })
  );
});

// 监听active事件
self.addEventListener("activate", (event) => {
  // 获取所有的缓存key值，将需要被缓存的路径加载放到缓存空间下
  const cacheDeletePromise = caches.keys().then((keyList) => {
    console.log("keyList:", keyList);
    Promise.all(
      keyList.map((key) => {
        if (key !== CACHE_NAME) {
          const deletePromise = caches.delete(key);
          //TODO:告诉用户需要重新刷新
          console.log("need reload");
          self.clients.matchAll().then(function (clients) {
            clients.forEach(function (client) {
              client.postMessage({
                command: "reload",
                message: "blablablablabla",
              });
            });
          });
          return deletePromise;
        } else {
          Promise.resolve();
        }
      })
    );
  });
  // 等待所有的缓存都被清除后，直接启动新的缓存机制
  event.waitUntil(
    Promise.all([cacheDeletePromise]).then((res) => {
      this.clients.claim();
    })
  );
});

// 拦截所有请求事件
// 如果缓存中已经有数据就直接用缓存，否则去请求数据
self.addEventListener("fetch", (e) => {
  console.log("处理fetch事件:", e.request.url);
  e.respondWith(
    caches
      .match(e.request)
      .then(function (response) {
        if (response) {
          console.log("缓存匹配到res:", response.url);
          const newRes = response.clone(); //因为response是一个流，只能用一次，所以这里要 clone 一下。
          return new Response(response.body, {
            ...newRes,
            //改写资源响应头，因为Chrome中memoryCache优先于ServiceWorkerCache，为了在demo里展示出来
            headers: {
              "cache-control": "max-age=0",
            },
          });
        }
        console.log("缓存未匹配对应request,准备从network获取", caches);
        return fetch(e.request);
      })
      .catch((err) => {
        console.error(err);
        return fetch(e.request);
      })
  );
});
