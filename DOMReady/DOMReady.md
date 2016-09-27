DOM构建的过程，我们必须知道两个事件
- `onload`事件，当它触发的时候，所有的文档资源加载完成，包括：DOM，样式表，脚本，图片，flash
- `DOMContentLoaded`事件，仅DOM加载完成时触发,其他资源还未加载完成

如果我们的脚本已经运行完了，但是需要操作的DOM还没加载到页面上，那么这时操作是没有效果的。这两个
事件就是为了避免这种情况发生，将执行函数放在其回调函数中，页面加载完才执行，那么就能有效的避免错误发生。

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
