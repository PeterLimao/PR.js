(function(window) {
    var PR = {};
    //模块状态
    var STATUS = {
        UNLOAD: '0',
        LOADING: '1',
        LOADED: '2',
        ERROR: '3'
    };

    //事件状态
    var EVENT = {
        COMPLETE: 'complete',
        ERROR: 'error'
    };

    //模块状态跟事件的映射，配置什么样的状态触发什么事件
    var eventStatusMapping = {};
    eventStatusMapping[STATUS.LOADED] = EVENT.COMPLETE;
    eventStatusMapping[STATUS.ERROR] = EVENT.ERROR;

    //默认配置
    var _config = {
        baseUrl: '../test/'
    };

    //设置配置
    var setConfig = function(obj) {
        for (var key in obj) {
            _config[key] = obj[key];
        }
    };

    //根据id得到模块的路径
    var getScriptUrl = function(id) {
        var id = id.indexOf('.js') === -1 ? id + '.js' : id;
        return _config.baseUrl + id;
    };

    //得到当前执行的代码片段
    var getCurrentScript = function() {
        if (document.currentScript) {
            return document.currentScript;
        }
        //TODO other browsers
    };

    //类型判断
    var _isType = function(obj, type) {
        return Object.prototype.toString.call(obj) === '[Object ' + type + ']';
    };

    var each = function(array, callback) {
        for (var i = 0; i < array.length; i++) {
            callback(i, array[i]);
        }
    };

    //加载模块
    var require = function(ids, callback) {
        var _self = this;
        var idsCount = 0;
        var _exports = [];
        if (!_isType(ids, 'Array')) {
            ids = [ids];
        }

        for (var i = 0; i < ids.length; i++) {
            idsCount++;
            _loadModule(ids[i], function(_export) {
                idsCount--;
                _exports.push(_export);
                if (idsCount === 0) {
                    callback.apply(this, _exports);
                }
            });
        }
    };

    //定义模块
    var define = function(id, deps, factory) {
        var mod = moduleCache[id],
            _self = this,
            _exports = [],
            depsCount = 0,
            depsLength = deps.length;
        mod.factory = factory;

        if (deps.length) {
            for (var i = 0; i < depsLength; i++) {
                depsCount++;
                _loadModule(deps[i], function(_export) {
                    depsCount--;
                    _exports.push(_export);
                    if (depsCount === 0) {
                        mod.exports = mod.factory.apply(mod, _exports);
                        mod.setStatus(STATUS.LOADED, mod.exports);
                    }
                });
            }
        } else {
            mod.exports = mod.factory();
            mod.setStatus(STATUS.LOADED, mod.exports);
        }
    };

    var _loadModule = function(id, callback) {
        //判断是否存在模块缓存
        var mod = moduleCache[id] || Module.getModule(id);

        mod.on(EVENT.COMPLETE, function(_export) {
            moduleCache[id].status = STATUS.LOADED;
            callback(_export);
        });

        mod.on(EVENT.ERROR, function(message) {
            moduleCache[id].status = STATUS.ERROR;
            throw new Error(message);
        });
    };

    var moduleCache = {};

    //模块对象
    var Module = function(id) {
        this.id = id;
        this.status = STATUS.UNLOAD
        this.deps = null;
        this.exports = {};
        this.factory = null;
        this.callbacks = {};
        this.load();
    };

    Module.getModule = function(id) {
        return new Module(id);
    };

    Module.prototype.on = function(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    };

    Module.prototype.trigger = function(event, action) {
        var _self = this;
        each(this.callbacks[event], function(i, callback) {
            callback.call(_self, action);
        });
    };

    Module.prototype.load = function() {
        var _self = this;
        var id = _self.id;
        //开始加载，并把mod扔进moduleCache
        _self.status = STATUS.LOADING;
        moduleCache[id] = _self;
        //加载script
        var script = document.createElement('script');
        script.id = id;
        script.async = true;
        script.src = getScriptUrl(id);
        document.head.appendChild(script);

        script.onerror = function() {
            _self.setStatus(STATUS.ERROR, 'module ' + id + 'is not exist');
        };
    };

    Module.prototype.setStatus = function(status, action) {
        if (this.status === status) {
            return;
        }
        this.trigger(eventStatusMapping[status], action);
    }

    PR.require = require;
    PR.define = define;
    PR.setConfig = setConfig;
    window.PR = PR;
})(window);
