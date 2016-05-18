#PR.js#
一个简单的javascript模块加载器

## 如何使用
###如何导入
在html文档中导入:
```
<script src="./PR.js"></script>
```
###加载一个模块
```
require(ids, factory)
```
###定义一个模块
```
define(id, deps, factory)
```
###例子
```
<script src="./PR.js"></script>
    <script>
        PR.require('testModule', function(testModule) {
            console.log(testModule.names);
        });
    </script>
```
```
PR.define('testModule2', [], function() {
    var testModule2 = {};
    testModule2.name = 'module2';
    return testModule2;
});
```
## TO DO

 - 支持cmd
 - 支持内联require
 - 处理循环依赖的问题
 
##LICENCE

MIT

