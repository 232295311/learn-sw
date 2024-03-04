// index.js
window.addEventListener("load", () => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker
      // scope是自定义sw的作用域范围为根目录，默认作用域为当前sw.js所在目录的页面
      .register("./sw.js", { scope: "./" })
      .then(function (registration) {
        // 注册成功后会返回registration对象，指代当前服务线程实例
        document.getElementById("register").innerHTML = "成功!";
      })
      .catch(function (err) {
        console.error(e);
        document.getElementById("register").innerHTML = "失败!";
      });

    navigator.serviceWorker.onmessage = function (event) {
      var data = event.data;
      if (data.command == "reload") {
        console.log(data);
        const myDialog = document.querySelector("#myDialog");
        myDialog.showModal();
      }
    };
  } else {
    console.log("当前浏览器不支持service worker");
  }
});
