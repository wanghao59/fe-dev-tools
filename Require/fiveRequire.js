/*实现一个require的基本结构
 * time:2016.09.19
 *email: hhermeswang@gmail.com
 * author: eddie
 * description: a requirejs
 */
(function(global) {
    //定义两个加载的对象
    //loadings:表示正在加载的模块
    //modules: 表示加载的模块
    var loadings = [],
        modules = {};

    //requirejs object
    var fiveRequireJS = {};

    //书写define函数
    fiveRequireJS.define = function(deps, callback) {
        //得到当前define的路径
        var id = fiveRequireJS.getCurrentJs();
        //将依赖放入一个队列中
        var depsId = [];
        deps.map(function(name) {
            depsId.push(fiveRequireJS.getScriptId(name));
        });
        //如果没有注册，就将其注册进入modules中
        if( !modules[id] ) {
            modules[id] = {
                id: id,
                state: 1,
                deps: depsId,
                callback: callback,
                exports: null,
                color: 0
            }
        }
    };

    fiveRequireJS.require = function(deps, callback) {

    };

    fiveRequireJS.getCurrentJs = function() {
        return
    };
})(window);
