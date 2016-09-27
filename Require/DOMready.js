var ready = function(win, fn) {
    var done = false, top = true,
        doc = win.document,
        root = doc.documentElement,
        modern = doc.addEventListener,
        add = modern ? 'addEventListener' : 'attachEvent',
        rem = modern ? 'removeEventListener' : 'detachEvent',
        pre = modern ? '' : 'on',

        init = function(e) {
            //如果dom意见加载完成，则结束整个domready函数
            if(e.type == 'readystatechange' && e.readyState == 'complete') return;
            //如果现在的dom加载，移除添加的监听事件
            (e.type == 'load' ? win : doc)[rem](pre+e.type, init, false);
            //判断dom是否加载完成，如果完成执行fn函数
            if( !done && ( done = true ) ) {
                fn.call(win, e.type || e);
            }
        },
        //轮询IE的DOM是否加载完成
        poll = function() {
            try {
                root.doScroll('left');
            } catch(e) {
                //通过setTimeout不断轮询调用poll方法，
                //如果成功则触发 DOMContentLoaded事件
                setTimeout(poll, 50);
                return;
            }
            init('poll');
        };
    //如果doc加载完成，执行fn函数，初始化都避免
    //懒加载，这时候可能存在重新加载的情况
    if( doc.readyState == 'complete' ) {
        fn.call(win, 'lazy');
    } else {
        //IE的doScroll在DOM加载完成之后才能出现
        //该方案可以解决页面有iframe时失效的问题。
        if( !modern && root.doScroll ) {
            //判断是否有frameElement元素在页面中
            try {
                top = !win.frameElement;
            } catch(e) {
            
            }
            //判断是否是iframe，如果不是的话，就一直轮询，加载主页面
            if( top ) {
                poll();
            }
        }
        //证明dom没有加载完成，添加监听事件
        doc.add(pre+'readystatechange',init, false);
        doc.add(pre+'DOMContentLoaded',init, false);
        doc.add(pre+'load',init, false);
    }
}