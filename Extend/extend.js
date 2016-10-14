var util = (function() {
    var class2type = {};
    ["Null","Undefined","Number","String","Object","Boolean","Date","Function","Array","RegExp"].forEach(function(item) {
        class2type["[object " +item+"]"] = item.toLowerCase();
    });

    function type(obj) {
        return obj == null ? String(obj) :
        class2type[ [].toString.call(obj) ] || "object";
    }

    function isFunction(obj) {
        return type(obj) === 'function';
    }

    function isArray(obj) {
        return type(obj) === 'array';
    }

    function isWindow(obj) {
        return obj != null && obj == obj.window;
    }

    function isPlainObject = function(obj) {
        //防止DOM node和全局window通过
        if( !obj || util.type(obj) !== 'object' || obj.nodeType || util.isWindow(obj) ) {
            return false;
        }

        try {
            //不拥有自己的构造函数属性肯定是对象
            if( obj.constructor && obj.hasOwnProperty("constructor") && obj.constructor.prototype.hasOwnProperty("isPrototypeOf") ) {
                return false;
            }
        } catch(e) {
            //在IE8，9里面如果发现是基本的类型会抛出一个错误
            return false;
        }

        var key;
        for(key in obj) {};

        return key === undefined && obj.hasOwnProperty(key);
    }

    return {
        isFunction: isFunction,
        isArray: isArray,
        isPlainObject: isPlainObject
    }
})();

function extend() {
    var options, name, src, copy, clone, copyIsArray,
        i = 1,
        length = arguments.length,
        target = arguments[0],
        deep = fasle;
    //判断用户是否使用了deep值
    if( typeof target == "boolean" ) {
        deep = arguments[0];
        target = arguments[1];
        //跳过前两个值，复制后面source上的值
        i++;
    }

    //如果用户传入的值为空或者只有一个，返回原值
    if( length === i ) {
        target = this;
        --i;
    }

    //如果传进来的不是是字符串等基本类型，定义为空对象
    if( typeof target !== "object" && !util.isFunction(target) ) {
        target = {};
    }

    for( ; i < length; i++ ) {
        //取到后面的需要复制的对象
        options = arguments[i];
        //不为空才能继续执行
        if( options !== null ) {
            //遍历这个对象
            for(name in options) {
                //找到目标和资源的属性值
                src = target[name];
                copy = options[name];

                //如果后面的复制的资源调用目标元素的值，造成死循环，退出当前循环
                if( target === copy ) {
                    continue;
                }

                //如果为对象或者数组，进行深复制
                if( deep && (util.isPlainObject(copy) || (copyIsArray = util.isArray(copy)) ) ) {
                    //如果是数组
                    if( copyIsArray ) {
                        copyIsArray = false;
                        //如果复制到目标对象中同样为数组，使用目标对象的数组，如果不是，创建一个空数组
                        clone = src && util.isArray(src) ? src : [];
                    } else {  //这儿能使用else是因为只能数组或者对象
                        clone = src && util.isPlainObject(src) ? src : {};
                    }
                    //循环调用extend函数，达到深复制的作用
                    target[name] = extend(deep, clone, copy);
                } else if( copy !== undefined ){
                    target[name] = copy;
                }
            }
        }
    }
    return target;
}
