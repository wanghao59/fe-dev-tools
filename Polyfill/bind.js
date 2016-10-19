//了解bind的使用情况之后在实现的话就会很简单
//绑定执行上下文 
//func.bind(this)

//最简单的实现版本
/** 
Function.prototype.bind = function(context) {
    var self = this;
    return function() {
        return self.apply(context, arguments);
    };
};

*/

/** 
 //考虑到函数柯里化
 Function.prototype.bind = function(context) {
     var slice = [].slice,
         args = slice.call(arguments,1);
    return function() {
        var innerArgs = slice.call(arguments),
            finalArgs = args.concat(innerArgs);

        return self.apply(context, finalArgs);
    }
 }
*/ 

//函数作为构造函数使用
Function.prototype.bind = function(context) {
    var slice = [].slice,
        self = this,
        //函数柯里化，原本固定的值提取
        args = slice.call(arguments,1),
        //绑定函数，作为一个中转转化函数
        //使绑定函数和调用函数处于同一原型链上
        nop = function() {},
        bound = function(){
            //柯里化添加的新的元素的值
            var innerArgs = slice.call(arguments),
                finalArgs = args.concat(innerArgs);
            //这个函数的执行使用new函数执行
            //调用函数和绑定函数在同一个原型链上，则使用this
            //this到底指向了哪儿？
            //总算找出来了
            //指向了用它new的对象，否则使用context
            //如果有错误，tm的马上直播
            return self.apply( this instanceof nop ? this : (context || {}), finalArgs );
        };
        //中转函数的原型修改为调用时的原型对象
        //使调用函数的原型链和绑定函数的原型链处于同一条原型链上
        nop.prototype = self.prototype;
        //使用new操作符，调用绑定的nop函数
        //这时，返回的对象也能正常使用instanceof
        bound.prototype = new nop();
        //返回的bound函数就是调用函数执行之后的结果
        return bound;
}
