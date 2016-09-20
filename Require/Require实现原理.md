AMD是提前执行，CMD是延迟执行
```JavaScript
//CMD 推崇依赖就近，代表为seajs
define(function(require, exports, module) {
    var a = require('./a');
    a.dosomething();
    var b = require('./b');
    b.dosomething();
});

//AMD 推崇依赖前置，代表为requirejs
define(['./a','./b'], function(a,b) {
    a.dosomething();
    b.dosomething();
});
```
### 1、如何异步加载js文件
这个在 *JavaScript的加载方式* 已经介绍过了
```javascript
fiveRequireJS.loadJS = function(url, callback) {
    //创建script节点
    var node = document.createElement("script");
    node.type = "text/javascript";

    if( node.readyState ) {
        node.onreadystatechange = function () {
            if( node.readyState == "loaded" || node.readyState == "complete" ) {
                node.onreadystatechange = null;
                callback();
            }
        };
    } else {
        node.onload = function() {
            if( callback ) {
                callback();
            }
        }
    }

    //监听 onerror 事件处理 JavaScript 加载失败的情况
    node.onerror = function() {
        throw Error("load script: " + url + " failed!" );
    }

    node.src = url;
    document.getElementsByTagName("head")[0].appendChild(node);
}
```

### 2、 Require如何按顺序加载模块
#### （1）组织依赖关系
- [1]模块放在哪儿，如何标记模块的加载状态？
modules储存了所有加载的模块，包括
    - 加载状态信息 state
    - 依赖模块信息 deps： []
    - 模块的回调函数 factory: callback
    - 回调函数callback返回的结果 exportds: {}
```javascript
modules = {
    id: {
        state: 1, //模块的加载状态
        deps: [], //模块的依赖关系
        factory: callback,  //模块的回调函数
        exports: {}  //本模块回调函数callback的返回结果，供依赖于该模块的其他模块使用
    }
}
```
- [2]正在加载但是还没有加载完成的模块id列表
每次脚本加载完成时，触发onload，这时都需要检查loading队列，确认哪些模块的依赖已经加载完成，是否可以执行
`loadings = [
    id,
]`

#### (2) define 函数实现原理
define函数的主要目的是将模块注册到factory列表中，方便require可以找到，同事要处理循环依赖问题

```javascript
fiveRequireJS.define = function(deps, callback) {
    //根据模块名获取模块的url
    var id = fiveRequireJS.getCurrentJs();
    //将依赖的name装换成id，也就是模块js文件的全路径
    var depsId = [];
    deps.map(function(name) {
        depsId.push(fiveRequireJS.getScriptId(name));
    });

//如果模块没有注册，就将模块加入modules列表
    if( !module[id] ) {
        modules[id] = {
            id: id,
            state: 1,  //模块加载装填
            deps: depsId,  //模块的依赖软席
            callback: callback,  //模块的回调函数
            exports: null, //本模块回调函数callback的返回结果，供依赖于该模块的其他模块使用
            color: 0
        }
    }
}
```

#### （3）require 函数实现原理
```javascript
fiveRequireJS.require = function(deps, callback) {
    //获取主模块id
    var id = fiveRequireJS.getCurrentJs();
    //将主模块main依赖中的name转换为id
    var depsId = [];
    deps.map(function(name) {
        depsId.push(fiveRequireJS.getScriptId(name));
    });
    //将主模块注册到models列表中
    modules[id] = {
        id: id,
        state: 1,
        deps: depsId,
        callback: callback,
        exports: null,
        color: 0
    }
    //加载依赖模块
    fiveRequireJS.loadDepsModule(id);
}
```

loadDepsModule 函数主要是 **递归加载一个模块的依赖模块**，通过 loadJS 在
dom结构中插入script完成js文件的载入和执行。这里loadJS的callback需要仔细研
究。每一个模块都是通过define函数定义的，由于callback函数在模块加载完成后才
会执行，所以callback函数执行时模块已经存在modules中了。相应的，我们也要将
该模块放入loading队列以便检查执行情况；同时递归调用loadDepsModule 加载该
模块的依赖模块。loadJS 在浏览器的 onload 事件触发时执行，这是整个模块加载
系统的驱动力。
```javascript
fiveRequireJS.loadDepsModule = function(id) {
    //依次处理本模块的依赖关系
    modules[id].deps.map(function(el) {
        //如果模块还没开始加载，则加载模块所在的js文件
        if( !modules[el] ) {
            fiveRequireJS.loadJS(el,function() {
                //模块开始加载时，放入加载队列，以便检查加载情况
                loadings.unshift(el);
                //递归的调用loadModel函数加载依赖模块
                fiveRequireJS.loadDepsModule(el);
                //加载完成后执行依赖检查，如果依赖全部加载完成就执行callback函数
                fiveRequireJS.checkDeps();
            });
        }
    });
}
```

checkDeps 函数，该函数在每次 onload 事件触发时执行，检查模块列表中是否已经
有满足执行条件的模块，然后开始执行。checkDeps也有一个小技巧，就是当存在满
足执行条件的模块时会触发一次递归，因为该模块执行完成后，可能使得依赖于该模
块的其他模块也满足了执行条件。
```javascript
fiveRequireJS.checkDeps = function() {
    //遍历加载列表
    for( var i = loadings.length, id; id = loadings[--i] ) {
        var obj = modules[id],
            deps = obj.deps,
            allloaded = true;
        //遍历每一个模块的加载
        fiveRequireJS.checkCycle(deps.id, colorbase++);
        for( var key in deps ) {
            //如果存在未加载完的模块，则退出内层循环
            if( !modules[deps[key]] || modules[deps[key]].state !== 2 ) {
                allloaded = false;
                break;
            }
        }

        //如果所有模块已经加载完成
        if( allloaded ) {
            loadings.aplice(i,1);  //从loadings列表中移除已经加载完成的模块
            //执行模块的callback函数
            fiveRequireJS.fireFactory(obj.id, obj.deps, obj.callback);
            //该模块执行完成后可能使其他模块也满足执行条件了，继续检查
            //直到没有模块满足allloaded条件
            fiveRequireJS.checkDeps();
        }
    }
}
```

require和define函数，都已一个参数列表，fireFactory首先处理的问题就是收集各个依赖模块的返回值，构建callback函数的参数列表；然后调用callback函数，同事记录模块的返回值，以表其他依赖于该模块的模块作为参数使用

```javascript
//fireFactory的工作是从各个依赖模块收集返回值，然后调用该模块的回调函数
fiveRequireJS.fireFactory = function(id, deps, callback) {
    var params = [];
    //遍历id模块的依赖，为callback准备参数
    for( var i = 0,d; d = deps[i++]; ) {
        params.push(modules[d].exports);
    };
    //在context对象上调用callback方法
    var ret = callback.apply(global, params);
    //记录模块的返回值，本模块的返回结果可能作为依赖模块的其他模块的回调函数的参数
    if( ret != void 0 ) {
        modules[id].exports = ret;
    }

    modules[id].state = 2; //标志模块已经加载并执行完成
    return ret;
}
```
