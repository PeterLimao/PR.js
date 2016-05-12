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
        LOAD: 'load',
        COMPLETE: 'complete',
        ERROR: 'error'
    };

    //模块状态跟事件的映射，配置什么样的状态触发什么事件
    var eventStatusMapping = {};
    eventStatusMapping[STATUS.LOADING] = EVENT.LOAD;
    eventStatusMapping[STATUS.LOADED] = EVENT.COMPLETE;
    eventStatusMapping[STATUS.ERROR] = EVENT.ERROR;

    //默认配置
    var _config = {
        baseUrl: ''
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

    var isType = function(obj, type) {
        return Object.prototype.toString.call(obj) === '[Object ' + type + ']';
    };

    var each = function(array, callback) {
        for (var i = 0; i < array.length; i++) {
            callback(i, array[i]);
        }
    };

    var require = function(ids, callback) {
        var _self = this;
        var idsCount = 0;
        var exports = [];
        if (!isType(ids, 'Array')) {
            ids = [ids];
        }

        for (var i = 0; i < ids.length; i++) {
            idsCount++;
            loadModule(ids[i], function(_export) {
                idsCount--;
                exports[i] = _export;
                if (idsCount === 0) {
                    callback.apply(_self, exports);
                }
            });
        }
    };

    var define = function() {
        var argsLength = arguments.length;
        switch(argsLength) {
            case 1:
                if (typeof arguments[0] === 'function') {

                }
                if (typeof arguments[0] === 'object') {

                }
                if (typeof arguments[0] === 'string') {

                }
            break;
            case 3:
            break;
            default:
                throw Error('you should use right params!');
            break;
        }
    };

    var _defineForString = function() {};
    var _defineForFunc = function() {};
    var _defineForObj = function() {};

    var loadModule = function(id, callback) {
        var mod = moduleCache[id] || Module.getModule(id);
        mod.on(EVENT.COMPLETE, function(_export) {
            callback(_export);
        });

        mod.on(EVENT.LOAD, function() {
            console.log('Module ' + id + ' is start load');
        });

        mod.on(EVENT.ERROR, function(message) {
            console.error(message);
        });
        mod.load();
    };

    var moduleCache = {};

    //模块对象
    var Module = function(id) {
        this.id = id;
        this.status = STATUS.UNLOAD
        this.deps = null;
        this.factory = null;
        this.callbacks = {};
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

    Module.prototype.trigger = function(event, message) {
        var _self = this;
        if (!this.callbacks[event]) {
            throw new Error('This ' + event + ' is not listen!');
        }
        each(this.callbacks[event], function(i, callback) {
            callback.call(_self, message);
        });
    };

    Module.prototype.load = function() {
        var _self = this;
        var id = _self.id;
        var script = document.createElement('script');
        script.id = id;
        script.async = true;
        script.src = getScriptUrl(id);
        document.head.appendChild(script);
        _self.setStatus(STATUS.LOADING);

        script.onerror = function() {
            _self.setStatus(STATUS.ERROR, 'module ' + id + 'is not exist');
        };
        script.onload = function() {
            _self.setStatus(STATUS.LOADED);
        };
    };

    Module.prototype.setStatus = function(status, message) {
        if (this.status === status) {
            return;
        }
        this.trigger(eventStatusMapping[status], message);
    }

    PR.require = require;
    PR.define = define;
    PR.setConfig = setConfig;
    window.PR = PR;
})(window);
