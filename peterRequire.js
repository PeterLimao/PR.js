(function(window) {
    //模块状态
    var STATUS = {
        UNFETCH: 0,
        FETCHING: 1,
        FETCHED: 2,
        LOADING: 3,
        LOADED: 4,
        EXECUTED: 5
    };

    //模块对象
    var moduleObj = function(moduleName, status, export, onload) {
        this.moduleName = moduleName;
        this.status = status || STATUS.UNFETCH;
        this.export = export;
        this.onload = onload || [];
    };

    //存储已经加载好的模块
    var modulesCache = {};

    //过滤js, 得到正确的js路径
    var getUrl = function(moduleName) {
        var url = moduleName.indexOf('.js') === -1 ? moduleName + '.js' : moduleName;
        return url;
    };

    //加载js
    var loadModule = function(moduleName, callback) {
        var currentModule = '';
        var fs = '';
        var url = getUrl(moduleName);

        if (modulesCache[moduleName]) {
            if (modulesCache[moduleName].status === STATUS.FETCHED) {
                window.setTimeout(callback(callback(modulesCache[moduleName].export)));
            } else {
                //TODO
            }
        } else {
            modulesCache[moduleName] = new moduleObj(moduleName, STATUS.FETCHING, null, [callback]);
            //创建script dom
            var script = document.createElement('script');
            script.id = moduleName;
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            script.async = true;
            script.src = url;
            //加载完成改变模块状态
            script.onload = function() {
                modulesCache[moduleName].status = STATUS.FETCHED;
            };

            fs = document.getElementsByTagName('script')[0];
            fs.parentNode.insertBefore(script, fs);
        }
    };

    var saveModule = function(modName, exports, callback) {
        if (modulesCache[modName]) {

        } else {
            callback && callback.apply(window, exports);
        }
    };

    var require = function(deps, callback) {
        var exports = [];
        var depCount = 0;
        var isEmpty = false;
        //得到正在执行的script的id, 如果不存在则为入口
        var modName = document.currentScript && document.currentScript.id || 'REQUIRE_MAIN';

        //判断是否存在依赖，存在则加载依赖，不存在直接保存modules
        if (deps.length) {
            for (var i = 0; i < deps.length; i++) {
                (function(i) {
                    depCount++;
                    loadModule(deps[i], function(export) {
                        depCount--;
                        exports[i] = export;
                        if (depCount === 0) {
                            saveModule(modName, exports[i], callback);
                        }
                    });
                })(i);
            }
        } else {
            isEmpty = true;
        }

        if (isEmpty) {
            window.setTimeout(function() {
                saveModule(modName, null, callback);
            });
        }
    };
    var config = function(configObj) {};
    var define = function(deps, callback) {};

    window.require = require;
    //TODO test
    window.modulesCache = modulesCache;
})(window);
