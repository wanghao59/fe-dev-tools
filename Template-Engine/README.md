##  Template Engine
模板引擎，js如何渲染html的页面

其中的核心是 *tplEngine.js* 函数

实现这个模板引擎的过程，其实就是了解如何拼接自己想要的字符串的一个过程，
核心要点有三点：
- 拼接想要的字符串，并push进一个数组
- 拼接js代码，执行js代码
- 如何使用Function或者with使字符串用函数执行

```javascript
var reg = /<%([^%>]+)?%>/g,  //寻找到<%%>里面执行的所有符合要求的代码
    regOut = /(^( )?(if|else|for|switch|case|break|{|})(.*)?)/g, //寻找<%%>中含有js逻辑的字符串
    code = 'var r = [];\n',  //code为拼接的字符串
    cursor = 0; //游标，拼接最后一句末尾字符串

//add函数，拼接字符串的函数
//line:匹配出来符合要求的字符串
//js: 是否是js逻辑代码
var add = function(line, js) {
    js ? ( /*如何是js逻辑代码，执行*/ ) : ( /* 如果不是js逻辑代码，执行 */ );
    return add;
}

//循环匹配出来的所有的字符串
while ( match = reg.exec(tpl) ) {
    add(tpl.slice(cursor, match.index))(match[1],true);
    cursor = match.index + match[0].length;
}

//拼接最后的字符串
add(tpl.substr(cursor, tpl.length - cursor));
code += 'return r.join("")';

//使用apply将data的作用域加到执行的函数中
return new Function(code.replace(/[\n\r\t]/g,'')).apply(data);
```

看完整个文件，逻辑很简单，慢慢吃透就能搞懂
期间遇到了js正则的一些地方，需要慢慢的推敲
