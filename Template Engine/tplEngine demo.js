//模板引擎
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

var tpl = '<% for(var i = 0; i < this.posts.length; i++) {' +　
        'var post = this.posts[i]; %>' +
        '<% if(!post.expert){ %>' +
            '<span>post is null</span>' +
        '<% } else { %>' +
            '<a href="#"><% post.expert %> at <% post.time %></a>' +
        '<% } %>' +
    '<% } %>';

var data = {
    "posts": [{
        "expert": "content 1",
        "time": "yesterday"
    },{
        "expert": "content 2",
        "time": "today"
    },{
        "expert": "content 3",
        "time": "tomorrow"
    },{
        "expert": "",
        "time": "eee"
    }]
};

console.log(tplEngine(tpl, data))
