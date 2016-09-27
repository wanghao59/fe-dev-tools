## Require的实现原理
### 网页中异步加载JavaScript
#### 1.并行的下载脚本
 ----
 （1）XHR eval
 通过XHR可以异步获取js脚本，并通过eval()执行
 ```JavaScript
 var xhrobj = getXHRObject();
 getXHRObject.onreadystatechange = function() {
     if( xhrObj.readyState == 4 && 200 == xhrObj.status ) {
         eval(xhrObj.responseText);
     }
 };
 xhrObj.open('GET','A.js',true);
 xhrObj.send('');
 ```
 XHR请求不能跨域，脚本必须和主页部署在相同的域中，脚本可并行下载，而且不阻塞其他资源，但无法保证多个脚本的执行顺序

 ----

 （2）script dom element
 在浏览器中插入script dom节点
 ```JavaScript
var scriptElem = document.createElement('script');
document.getElementsByTagName('head')[0].appendChild(scriptElem);
 ```
 允许跨域，不阻塞其他资源下载。除了Firefox和Opera脚本按文档出现顺序执行
 其他浏览器需要开发者自己实现顺序控制，如：Require.js

 ----
 （3）document write script tag
 `document.write("<script type="text/javascript" src='A.js'></script>")`
 其会阻塞其他资源并行下载，这种方式可以保证脚本按文档中出现的顺序执行

 ---
 （4）defer和async属性
大多数浏览器都有 defer 和 asunc属性
1. 如果 async="async"：脚本相对于页面的其余部分异步地执行（当页面继续进行解析时，脚本将被执行）
2. 如果不使用 async 且 defer="defer"：脚本将在页面完成解析时执行
3. 如果既不使用 async 也不使用 defer：在浏览器继续解析页面之前，立即读取并执行脚本

async="async"不会阻塞其他资源，但是无法保证脚本的执行顺序。defer="defer"阻塞其他资源的加载，并且可以保证脚本的执行顺序，但是要到页面解析完成后才开始执行脚本。

#### 2.脚本的执行顺序
（1）保证行内脚本和外部脚本的执行顺序
[1].硬编码回调
如果web开发者能够控制外部脚本，可以在外部脚本回调行内脚本

[2].onload事件
添加script dom节点时，监听加载事件，当脚本成功加载时调用callback（外部脚本）函数
```javascript
//行内元素
function callback() {
    console.log('callback');
}
//异步加载函数
function loadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if( script.readyState ) {  //IE
        script.onreadystatechange = function() {
            if( script.readyState == "loaded" || script.readyState == "complete" ) {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {
        script.onload = function() {
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

//控制行内脚本和外部脚本的执行顺序
loadScript('a.js',callback);
```
[3].定时器
通过定时检查外部脚本的相应变量是否定义，可以判断外部脚本是否加载并执行成功
```html
<script src="MyJs.js"></script>
<script type="text/javascript">
    function callback() {

    }
    function checkMyJs() {
        if( undefined === typeof(MyJS) ) {
            setTimeout(checkMyJs,300);
        } else {
            callback();
        }
    }
</script>
```

(2)保证多个外部脚本之间的执行顺序
[1].同域中的脚本
对于同域中的多个外部脚本，可以使用XHR的方式加载脚本，并通过一个队列来控制脚本的执行顺序
```javascript
ScriptLoader.Script = {
    //脚本队列
    queueScript = [];
    loadScriptXhrInjection : function(url, onload, bOrder) {
        var iQ = ScriptLoader.Script.queueScript.length;
        if( bOrder ) {
            var qScript = {response: null, onload: onload, done: false};
            ScriptLoader.Script.queueScript[iQ] = qScript;
        }
        var xhrObj = ScriptLoader.Script.getXHRObject();
        xhrObj.onreadystatechange = function() {
            if( xhrObj.readyState == 4 ) {
                //有顺序要求的，按添加顺序执行
                if( bOrder ) {
                    ScriptLoader.Script.queueScript[iQ].response = xhrObj.responseText;
                    //执行脚本队列
                    ScriptLoader.Script.injectScripts();
                } else {
                    eval(xhrObj.responseText);
                    if( onload ) {
                        onload();
                    }
                }
            }
        }
    },

    injectScripts: function() {
        var len = ScriptLoader.Script.queueScript.length;
        for( var i=0; i<len; i++ ) {
            var qScript = ScriptLoader.Script.queueScript[i];
            //没有执行
            if( !qScript.done ) {
                //没有加载完成
                if( !qScript.response ) {
                    //停止，等待加载完成，由于脚本是按照顺序添加到队列中，因此这里保证了脚本的执行顺序
                    break;
                } else {
                    //已经加载完成
                    eval(qScript.response);
                    if( qScript.onload ) {
                        qScript.onload();
                    }
                    qScript.done = true;
                }
            }
        };
    },

    getXHRObject: function() {
        //创建XMLHttpRequest对象
    }
}

ScriptLoader.Script.loadScriptXhrInjection('A.js',null,false);
ScriptLoader.Script.loadScriptXhrInjection('B.js',InitB,true);
ScriptLoader.Script.loadScriptXhrInjection('C.js',InitC,true);
```
[2]不同域中的脚本
script dom element可以异步脚本，不阻塞其他资源，并且在Firefox和opera可以保证顺序执行；而document write script 可以异步加载加班呢，会阻塞其他资源。所以两种版本都可以选择
```javascript
ScriptLoader.Script {
    loadScriptDomElement: function(url, onload) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if( script.readyState ) {  //IE
            script.onreadystatechange = function() {
                if( script.readyState == "loading" || script.readyState == "complete" ) {
                    script.onreadystatechange = null;
                    onload();
                }
            };
        } else {
            script.onload = function() {
                onload();
            };
        }
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    },
    loadScriptDomWrite: function(url, onload) {
        document.write('<script src="' +url+ '"type="text/javascript"></script>' );
        if( onload ) {
            if( elem.addEventListener ) {  //other
                elem.addEventListener(window,'load',onload);
            } else if( elem.attachEvent ) { //IE
                    elem.addEventListener(window,'onload', onload)
            }
        }
    },
    //根据浏览器选择浏览器加载js的方式
    loadScript: function (url, onload) {
        if( -1 != navigator.userAgent.indexOf('Firefox') || -1 != navigator.userAgent.indexOf('Opera') ) {
            //浏览器为Firefox或Opera通过script dom elemnt，保证脚本执行顺序
            DomTag.script.loadScriptDomElement(url, onload);
        } else {
            //当为其他浏览器是，通过document write script保证脚本执行顺序。此时脚本的加载hi阻塞其他资源
            DomTag.script.loadScriptDomWrite(url,onload);
        }
    }
}
ScriptLoader.script.loadScript('A.js',initA);
ScriptLoader.script.loadScript('B.js',initB);
```
