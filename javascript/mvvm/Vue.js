// Vue 组件构造器
function Vue(options) {
  // 确定 DOM
  this.element = document.querySelector(options.el)
  // 记录数据
  this.data = options.data
  // 监视数据改动
  this.observe()
  // 编译模板
  this.compile()
}

// 监视模型数据
Vue.prototype.observe = function () {
  // 遍历全部的data模型数据
  Object.keys(this.data).forEach(attr => {
    Object.defineProperty(this, attr, {
      get() {
        return this.data[attr]
      },
      set(value) {
        this.data[attr] = value
        // 数据修改的时候，通过监视器模式，监视器改变
        watcherSet.notify(attr)
      }
    })
  })
}

// 编译模板
Vue.prototype.compile = function() {
  let vm = this
  let pattern = /{{\s*(\w+)\s*}}/
  // 遍历全部的 DOM 节点
  Array.from(vm.element.children).forEach(node => {
    // 处理 v-model 属性
    if (node.hasAttribute("v-model")) {
      let attr = node.getAttribute("v-model")
      node.value = vm[attr]
      // DOM 更新修改模型
      node.addEventListener("input", e => {
        vm[attr] = e.target.value
      }) 
      // 增加一个观察者
      new Watcher(attr, () => {
        node.value = vm[attr]
      }) 
    }
    // 处理 {{ }} 
    else if (pattern.test(node.innerHTML)) {
        // 利用正则表达式，找到内容中 {{ }} 的部分，替换为当前模型的值
        node.originInnerHTML = node.innerHTML
        let match = node.originInnerHTML.match(pattern)
        let attr = match[1]
        node.innerHTML = node.originInnerHTML.replace(pattern, vm[attr]);
        // 增加一个观察者
        new Watcher(attr, () => {
          node.innerHTML = node.originInnerHTML.replace(pattern, vm[attr]);
        }) 
    }
  })
}


// 观察者构造器
function Watcher(attr, update) {
  this.attr = attr
  this.update = update
  // 将当前观察者加入观察者集合
  watcherSet.register(this)
}

// 观察者集合构造器
function WatcherSet() {
  this.members = {}
}
// 注册观察者
WatcherSet.prototype.register = function(watcher) {
  // 每个属性使用一个 Set 集合，来存储观察者
  if (this.members[watcher.attr]) {
    this.members[watcher.attr].add(watcher)
  } else {
    this.members[watcher.attr] = new Set([watcher])
  }
}
// 通知某个属性的更新方法执行
WatcherSet.prototype.notify = function(attr) {
  // 调用当前属性上每个观察者的 update 方法，更新 DOM
  this.members[attr].forEach((watcher) => {
    watcher.update()
  })
}

// 观察者集合
var watcherSet = new WatcherSet()