### Watcher

数据观察者

#### 安装

> npm i @~crazy/watcher -S

#### 使用
```JavaScript
import { Watcher, addWatch, protect, readonly } from '@~crazy/watcher';

// 原始数据
const originalData = {
	width: 100,
	height: 100,
	x: 0,
	y: 0,
	style: {
		color: '#000',
		borderWidth: 2,
		borderColor: '#DDD',
	},
	classList: ['box', 'container'],
};

// 创建 Watcher
const data = new Watcher(originalData, {
	// 添加全局观察, 因为是全局，所以 record 为 null
	default: (record, bubble) => {
		console.log(bubble);
	},
});

data.x = 10;
/**
 * 输出
 {
	timestamp: 1657704905426,
	type: 'Update',
	path: ['x'],
	key: 'x',
	isNew: false,
	hasChange: true,
	originValue: 0,
	oldValue: 0,
	value: 10,
}
 **/
```

#### 观察属性
```JavaScript
// 观察 style.color
data.addWatch('style.color', (record) => {
	console.log(record.path);
});
data.style.color = '#F00'; // 输出 ['style', 'color']

// 立即触发 style.color 的观察
data.addWatch('style.color', {
	handler(record) {
		console.log(record.path); // 输出 ['style', 'color']
	},
	immediate: true,
});
```

#### 深观察
```JavaScript
// 深观察 style
data.addWatch('style', {
	handler(record, bubble) {
		// 表示当前 style 的数据记录，
        // 因为子孙属性改变时 style 也改变了，
        // 此时的 record 会包含一个 bubble 属性指向发生变化的源
		console.log(record);
		// 平时 bubble 为 null， 
        // 当子孙属性发生变化时，
        // 如果祖先使用了深观察，
        // 那就会开始向上冒泡，bubble 表示真正修改的数据记录
		console.log(bubble);
	},
	deep: true,
});
data.style.color = '#FF0';
/**
 * 输出
    record
    {
        "timestamp": 1657706407402,
        "type": "Add",
        "path": ["style"],
        "key": "style",
        "isNew": false,
        "hasChange": true,
        "originValue": {
            "color": "#FF0",
            "borderWidth": 2,
            "borderColor": "#DDD"
        },
        "value": {
            "color": "#FF0",
            "borderWidth": 2,
            "borderColor": "#DDD"
        },
        "bubble": {
            "timestamp": 1657706407403,
            "type": "Update",
            "path": [
                "style",
                "color"
            ],
            "key": "color",
            "isNew": false,
            "hasChange": true,
            "originValue": "#000",
            "oldValue": "#F00",
            "value": "#FF0"
        }
    }
    bubble
    {
        "timestamp": 1657706407403,
        "type": "Update",
        "path": ["style", "color"],
        "key": "color",
        "isNew": false,
        "hasChange": true,
        "originValue": "#000",
        "oldValue": "#F00",
        "value": "#FF0"
    }
 **/
```

#### 观察数组
```JavaScript
addWatch(data, 'classList', (record) => {
	console.log(record);
});
// 对数组内元素进行修改
data.classList[0] = 'newBox';
/**
 * 输出
    {
        "timestamp": 1657707309892,
        "type": "Update",
        "path": ["classList", "0"],
        "key": "0",
        "isNew": false,
        "hasChange": true,
        "originValue": "box",
        "oldValue": "box",
        "value": "newBox"
    }
 **/
```

#### 使用代理方式观察属性
```JavaScript
/**
 * 使用代理方式添加 style.color 的观察
 *
 * 因为 data.addWatch 函数是 Watcher 的实例函数，
 * 而 data.style 是一个 ProxyObject (代理对象)，无法通过 data.style.addWatch 添加观察
 * 所以需要使用代理方式为其添加观察
 * 
 * Watcher.prototype.addWatch 是根据值路径去解析的
 * 代理方式的好处是在代码执行时通常获取到代理对象时无法知道路径，
 * 使用代理方式可以忽略路径直接观察
 **/
addWatch(data.style, 'color', {
	handler(record) {
		console.log(record.value); // 输出 #F00
	},
	immediate: true,
});
```

#### 保护&只读
```JavaScript
// 保护 height 属性，保护后无法修改属性的值，
// 只能通过函数返回的 setter 函数进行设置
const setter = protect(data, 'height');
data.height = 200; // 输出： Assignment to protection variable 'height'

// 通过 setter 修改只读属性
setter((proxy) => {
	proxy.height = 200;
});
console.log(data.height); // 输出： 200

// 设置 style.borderWidth 为只读
readonly(data.style, 'borderWidth');
// 尝试修改
data.style.borderWidth = 10; 
// 输出： Assignment to readonly variable 'borderWidth'
</script>
```