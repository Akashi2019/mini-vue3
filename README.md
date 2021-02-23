



# mini-vue3

手写一个mini版的vue3框架

## 环境搭建

### 一、前提

- Monorepo 是管理项目代码的一个方式，指在一个项目仓库中管理多个模块/包
- 需要在全局安装yarn并初始化项目

```js
npm i yarn -g
yarn init -y
```

### 二、vue项目结构

```sh
							+---------------------+
                            |                     |
                            |  @vue/compiler-sfc  |
                            |                     |
                            +-----+--------+------+
                                  |        |
                                  v        v
               +---------------------+    +----------------------+
               |                     |    |                      |
     +-------->|  @vue/compiler-dom  +--->|  @vue/compiler-core  |
     |         |                     |    |                      |
+----+----+    +---------------------+    +----------------------+
|         |
|   vue   |
|         |
+----+----+   +---------------------+    +----------------------+    +------------------+
    |         |                     |    |                      |    |                  |
    +-------->|  @vue/runtime-dom   +--->|  @vue/runtime-core   +--->|  @vue/reactivity |
              |                     |    |                      |    |                  |
              +---------------------+    +----------------------+    +------------------+
```

### 三、安装依赖

```js
yarn add typescript rollup rollup-plugin-typescript2 @rollup/plugin-node-resolve @rollup/plugin-json execa
```

### 四、生成ts配置文件

```js
npx tsc --init
```

### 五、生成软链

```js
yarn install
```

