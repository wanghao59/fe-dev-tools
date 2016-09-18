Document.readyState 描述 loading 状态的文件
其有三个状态
- loading： 文件还在加载
- interactive ： document已经加载完，但是images，stylesheets和frames仍在加载
- complete ： 所有文件加载完，这个状态表明load事件被释放了。

readystatechange 作为一个 alteractive 模拟 DOMContentLoaded 事件,
DOMContentLoaded 是Document加载完成，相当于interactive 状态
```JavaScript
document.readystatechange = function() {
    if( document.readyState === 'interactive' ) {
        initApplication();
    }
}
```

readystatechange 作为一个 加载事件 load 模拟 alteractive 去响应
load 事件相当于 complete 状态
```javascript
document.readystatechange = function() {
    if( document.readyState === 'complete' ) {
        initApplication();
    }
}
```
