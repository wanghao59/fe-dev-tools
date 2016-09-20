/*实现一个require的基本结构
 * time:2016.09.19
 *email: hhermeswang@gmail.com
 * author: eddie
 * description: a requirejs
 */
(function(global) {
    //定义两个加载的对象
    //loadings:表示正在加载的模块,加载完后移除
    //modules: 存放所有开始加载的模块的信息，包括加载完成的模块
    var loadings = [],
        modules = {};

    // 检查循环依赖的颜色标记
    var colorbase = 1;

    //主程序的入口,
    //basepath为fiveRequireJS的文件地址
    var basepath = '',
        init = false;
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
        //获取主模块id
        var id = document.getCurrentJs();

        //帮主模块main注册到modules中
        if( !modules[id] ) {
            //依赖的集合
            var depsId = [];
            deps.map(function(name) {
                depsId.push(fiveRequireJS.getScriptId(name));
            });

            modules[id] = {
                id: id,
                state: 1,
                deps: depsId,
                callback: callback,
                exports: null,
                color: 0
            };
            //这里是main函数的入口，放入loadings中触发回调
            loadings.unshift(id);
        }
        //加载依赖模块
        fiveRequireJS.loadDepsModule(id);
    };

    fiveRequireJS.loadDepsModule = function(id) {
        //依次处理本模块的依赖关系
        modules[id].deps.map(function(el) {
            //如果模块还没加载，加载所在模块的js
            if( !modules[el] ) {
                fiveRequireJS.loadJS(el, function() {
                    //模块开始时，放入加载队列，以便检查加载情况
                    loadings.unshift(el);
                    //递归调用loadDepsModule函数调用依赖模块
                    fiveRequireJS.loadDepsModule(el);
                    //加载完成后执行依赖检查，如果依赖全部加载完成就执行callback函数
                    fiveRequireJS.checkDeps();
                });
            }
        });
    };

    //检查循环依赖的情况
    //遍历过程中标记颜色，如果发现节点标记了颜色，则表明存在循环依赖
    fiveRequireJS.checkCycle = function(deps, id, color) {
        //检查id的依赖模块
        //如果依赖模块加载完成，则不存在循环依赖
        if( modules[id].state != 2 ) {
            for( var depid in deps ) {
                //如果发现节点被标记过了，肯定存在循环依赖
                if( modules[deps[depid]] ) {
                    if( modules[deps[depid]].color >= color ) {
                        throw Error("circular dependency detected");
                    } else if( modules[deps[depid]] < color ) {
                        modules[deps[depid]].color = color;
                    }

                    if( modules[deps[depid]].state != 2 ) {
                        fiveRequireJS.checkCycle(modules[deps[depid]].deps, id, color);
                    }
                }
            }
        }
    };

    //检查函数的依赖是否加载完成，每一次的onload都会触发一次
    fiveRequireJS.checkDeps = function() {
        //遍历依赖列表
        for( var i = loadings.length, id; id = loadings[--i] ) {
            var obj = modules[id],
                deps = obj.deps,
                allloaded = true;
            //遍历每一个模块的加载
            fiveRequireJS.checkCycle(deps, id, colorbase++);
            for( var key in deps ) {
                //如果存在未加载完成的模块，跳出内层循环
                if( !modules[deps[key]] || modules[deps[key]] != 2 ) {
                    allloaded = false;
                    break;
                }
            }

            //如果所有的依赖加载完成
            if( allloaded ) {
                //从loadings中把加载完成的模块移除
                loadings.splice(i,1);
                //执行加载完成的模块
                fiveRequireJS.fireFactory(obj.id, obj.deps, obj.callback);
                //该模块完成后可能使其他模块也满足执行条件，继续检查，直到没有模块满足allloaded条件
                fiveRequireJS.checkDeps();
            }
        }
    };

    //fireFctory从各个依赖模块中调用得到返回值，然后调用该模块的回调函数
    fiveRequireJS.fireFctory = function(id, deps, callback) {
        var params = [];
        //遍历id的依赖，为callback准备参数
        for( var i = 0, d; d = deps[i++]; ) {
            params.push(modules[d].exports);
        };
        //在context对象上调用callback对象
        var ret = callback.apply(global, params);
        //记录模块的返回结果，本模块的返回结果可能作为依赖模块的其他模块的回调函数的参数
        if( ret != void 0 ) {
            modules.exports = ret;
        }
        modules[id].state = 2;
        return ret;
    };

    fiveRequireJS.loadJS = function(url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";

        script.onload = function() {
            if( callback ) {
                callback();
            }
        };

        script.onerror = function() {
            throw Error("load script: " +url+ "failed!" );
        }

        script.src = basepath + url + '.js';
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    fiveRequireJS.init = function() {
        if( !init ) {
            var currentScript = document.getCurrentJs();
            //获取basepath
            basepath = currentScript.replace(/[^\/]+\.js/i,'');
            //初始化
            init = true;
            //入口函数的js文件
            var nodes = document.getElementsByTagName("script");
            var node = nodes[nodes.length - 1];
            var mainjs = node.getAttribute("data-main");
            mainentry = mainjs;
            //首先需要加载入口js文件并且执行
            fiveRequireJS.loadJS(mainjs, null);
        }
    };

    fiveRequireJS.getCurrentJs = function() {
        //获取加载的js的script标签的值
        return document.currentScript.src;
    };

    //获得用户完整的js文件路径值
    fiveRequireJS.getScriptId = function(name) {
        //首先保证用户能加载main函数
        if( !init ) {
            fiveRequireJS.init();
        }
        return basepath + name +'.js'
    };

    fiveRequireJS.init();
    global.define = fiveRequireJS.define;
    global.require = fiveRequireJS.require;
})(window);
