<template>
	<div class="home"></div>
</template>

<script lang="ts" setup>
import * as Spanner from '@~crazy/spanner';
import {
	Watcher,
	getTarget,
	addWatch,
	readonly,
	protect,
	getRecorder,
} from '@~crazy/watcher';

function createWatcher() {
	console.time('new Loader - Watcher');

	const options = {
		// 开发者模式
		dev: false,
		// 项目名称
		name: 'demo',
		// 备注
		remark: '',
		// 加载器配置
		loader: {
			// 禁用 Widget 事件
			disabledWidgetEvent: false,
			// 禁止移动
			disabledMove: false,
			// 禁止选择
			disabledSelect: false,
			// 显示 FPS
			fps: false,
			// 显示像素尺
			pixelRuler: false,
			// 显示标记线
			markLine: false,
			// 最大缩放值
			maxScale: 10,
			// 最小缩放值
			minScale: 0.1,
			// 主题色
			theme: 'rgb(255, 124, 0)',
			// 背景颜色
			color: '#000',
			// 栅格样式
			grille: {
				// 显示栅格
				visible: false,
				// 显示为块状模式, false 为线条模式
				block: false,
				// 栅格颜色
				color: '#333',
				// 栅格尺寸
				size: 10,
				// 线宽。 仅在线条模式有效
				lineWidth: 1,
				// 栅格对齐
				align: false,
			},
			// 每帧渲染组件数
			renderingPerFrame: 4,
			// 使用方向键时的移动速度
			moveingSpeed: 5,
		},
		// 当前模式
		mode: 'loader',
		// 页面列表
		views: {
			home: {
				// 名称
				name: '',
				// 背景颜色
				color: '',
				nodes: {},
				// 位置偏移
				translate: {
					x: 0,
					y: 0,
				},
				// 缩放
				scale: 1,
			},
		},
		// 当前页面
		currentView: null,
		// 数据字典
		dictionary: {},
		// 全局配置
		globalOptions: {},
		// 自定义数据
		customData: {},
	};

	const size = 100;

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			options.views.home.nodes[Spanner.createID()] = {
				// 类型
				type: 'Widget',
				// 临时容器
				isTemp: false,
				// 数据源
				datasource: '',
				// 附加数据源
				appendDataSourceList: [],
				/**
				 * 事件类型
				 * click 单击
				 * dblclick 双击
				 */
				eventType: '',
				/**
				 * 触发类型
				 * 0 切换页面
				 * 1 跳转外部页面
				 */
				triggerType: '',
				// 触发内容
				triggerValue: '',
				// 位置坐标
				x: i * 60,
				y: j * 60,
				// 尺寸
				width: 50,
				height: 50,
				// 最小尺寸
				minWidth: 20,
				minHeight: 20,
				// 旋转度数
				rotate: 0,
				// 透明度
				opacity: 1,
				// 填充
				fill: {
					// 显示
					visible: false,
					// 样式
					style: '#CCC',
				},
				// 描边
				stroke: {
					// 显示
					visible: false,
					// 样式
					style: '#FFF',
					// 线条宽度
					width: 1,
					// 虚线间隔
					dash: [],
					// 开启虚线动画
					animate: false,
					// 虚线偏移量
					offset: 0,
				},
				// 锚点
				anchors: {},
				// 锚点等比例显示
				anchorRatio: false,
				// 循环遍历输出
				loop: {
					// 打开循环
					open: false,
					// 循环长度
					length: 10,
					// 开始下标
					startIndex: 0,
					// 排版
					typesetting: {
						// 每行显示个数
						perLineCount: 5,
						// 间距
						spacing: {
							top: 10,
							right: 10,
							bottom: 10,
							left: 10,
						},
					},
				},
				// 自定义数据
				customData: {},
			};
		}
	}

	(options.views.home.nodes as any).test = {
		// 类型
		type: 'Widget',
		// 临时容器
		isTemp: false,
		// 数据源
		datasource: '',
		// 附加数据源
		appendDataSourceList: [],
		/**
		 * 事件类型
		 * click 单击
		 * dblclick 双击
		 */
		eventType: '',
		/**
		 * 触发类型
		 * 0 切换页面
		 * 1 跳转外部页面
		 */
		triggerType: '',
		// 触发内容
		triggerValue: '',
		// 位置坐标
		x: 60,
		y: 60,
		// 尺寸
		width: 50,
		height: 50,
		// 最小尺寸
		minWidth: 20,
		minHeight: 20,
		// 旋转度数
		rotate: 0,
		// 透明度
		opacity: 1,
		// 填充
		fill: {
			// 显示
			visible: false,
			// 样式
			style: '#CCC',
		},
		// 描边
		stroke: {
			// 显示
			visible: false,
			// 样式
			style: '#FFF',
			// 线条宽度
			width: 1,
			// 虚线间隔
			dash: [],
			// 开启虚线动画
			animate: false,
			// 虚线偏移量
			offset: 0,
		},
		// 锚点
		anchors: {},
		// 锚点等比例显示
		anchorRatio: false,
		// 循环遍历输出
		loop: {
			// 打开循环
			open: false,
			// 循环长度
			length: 10,
			// 开始下标
			startIndex: 0,
			// 排版
			typesetting: {
				// 每行显示个数
				perLineCount: 5,
				// 间距
				spacing: {
					top: 10,
					right: 10,
					bottom: 10,
					left: 10,
				},
			},
		},
		// 自定义数据
		customData: {},
	};

	const loaderWatcher = new Watcher(options, {
		default: {
			handler: (record, bubble) => {
				console.log(record, bubble);
			},
			deep: true,
			immediate: true,
		},
	});

	readonly(loaderWatcher.views.home.nodes.test, 'type');
	protect(loaderWatcher.views.home.nodes.test, 'x');

	addWatch(loaderWatcher.views.home.nodes, 'test', {
		handler: (record, bubble) => {
			console.log(record, bubble);
			console.log(
				getRecorder(loaderWatcher.views.home.nodes.test).get('x')
			);
		},
		deep: true,
	});

	const loaderWatcherGetter = getTarget(loaderWatcher);
	for (let i in loaderWatcherGetter.views.home.nodes) {
		loaderWatcherGetter.views.home.nodes[i].type;
		loaderWatcherGetter.views.home.nodes[i].isTemp;
		loaderWatcherGetter.views.home.nodes[i].datasource;
		loaderWatcherGetter.views.home.nodes[i].appendDataSourceList;
		loaderWatcherGetter.views.home.nodes[i].eventType;
		loaderWatcherGetter.views.home.nodes[i].triggerType;
		loaderWatcherGetter.views.home.nodes[i].triggerValue;
		loaderWatcherGetter.views.home.nodes[i].x;
		loaderWatcherGetter.views.home.nodes[i].y;
		loaderWatcherGetter.views.home.nodes[i].width;
		loaderWatcherGetter.views.home.nodes[i].height;
		loaderWatcherGetter.views.home.nodes[i].minWidth;
		loaderWatcherGetter.views.home.nodes[i].minHeight;
		loaderWatcherGetter.views.home.nodes[i].rotate;
		loaderWatcherGetter.views.home.nodes[i].opacity;
		loaderWatcherGetter.views.home.nodes[i].fill;
		loaderWatcherGetter.views.home.nodes[i].stroke;
		loaderWatcherGetter.views.home.nodes[i].anchors;
		loaderWatcherGetter.views.home.nodes[i].anchorRatio;
		loaderWatcherGetter.views.home.nodes[i].loop;
		loaderWatcherGetter.views.home.nodes[i].customData;
	}

	(window as any).loaderWatcher = loaderWatcher;

	console.timeEnd('new Loader - Watcher');
}

createWatcher();
</script>

<style></style>
