var fiveTpl = function(str, data) {
    //获取html中的模板
    //处理模板放在div或在JavaScript中
    var element = document.getElementById(str);
    
    //匹配替换引擎
    var tplEngine = function(tpl, data) {
        //正则匹配，找到js代码<%%>
        var reg = /<%([^%>]+)?%>/g,
        //正则匹配包含if和for等js代码
            regOut = /(^( )?(if|for|else|switch|case|break|{|})(.*)?)/g,
            code = 'var r=[];\n',
            cursor = 0;
        //拼接字符串
        var add = function(line, js) {
            js ? ( code += line.match(regOut) ? line + '\n' : 'r.push(' + line + ');\n' ) :
                ( code += line != '' ? 'r.push("' + line.replace(/"/g,'\\"') + '");\n' : '' );
            return add;
        };

        //循环匹配符合要求的字符
        while( match = reg.exec(tpl) ) {
            add(tpl.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        //匹配加上最后的一段字符段
        add(tpl.substr(cursor, tpl.length - cursor));
        code += 'return r.join("");';
        //绑定作用域到data中
        return new Function(code.replace(/[\n\t\r]/g,'')).apply(data);
    };

    if( element ) {
        var html = element.innerHTML;
        return tplEngine(html, data);
    } else {
        //用户直接传递字符串
        return tplEngine(str, data);
    }
};
