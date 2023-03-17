import * as Spanner from '@~crazy/spanner';

import {
	$WATCH_ID,
	$SET_HANDLER,
	ProxyObject,
	PathGroup,
	Record,
	History,
	WatchHandler,
	WatchOptions,
	WatchType,
	KeyType,
} from '../Constants';

import {
	buildProxy,
	getPath,
	getSuperior,
	getTarget,
	getWatcher,
} from '../Proxy';

import getWatchOptions from './getWatchOptions';
export * from './operationKey';
import { parseKey, composeKey } from './operationKey';

export { getWatchOptions };

export interface WatchList {
	[propName: string]: WatchType;
}
export interface DataList {
	[propName: KeyType]: any;
}
export type WatchGroup = Array<WatchHandler | WatchOptions>;
type WatchEntityList = Map<string, WatchOptions>;
type ImmediateWatchCallback = Map<string, WatchHandler>;
interface TriggerItem {
	key: string;
	path: PathGroup;
	callbacks: WatchEntityList | ImmediateWatchCallback;
}
type WatchEntityListMap = Map<string, WatchEntityList>;
type ImmediateWatchCallbacksMap = Map<string, ImmediateWatchCallback>;
export type RemoveWatch = () => void;

export interface Watcher {
	[propName: string | symbol]: any;
}

/**
 * 观察者
 */
export class Watcher implements Watcher {
	/**
	 * @param data 原始数据
	 * @param watchList 观察列表
	 * @param beforeHandler 创建前回调句柄
	 * @returns
	 */
	constructor(
		data: {},
		watchList: WatchList = {},
		beforeHandler?: (proxy: ProxyObject) => void
	) {
		for (let key in data) {
			this[key] = data[key];
		}
		const proxy = buildProxy(this, {
			watcher: this,
			setHandler: (record) => {
				const path: PathGroup = [...record.path];
				path.splice(0, getPath(proxy).length);
				if (
					Spanner.isPlainObject(record.value) ||
					Spanner.isArray(record.value)
				) {
					this.#triggerDeppImmediateWatch.call(
						proxy,
						composeKey(path.join('.'))
					);
				}
				this.#triggerWatch.call(proxy, path, record);
				const superior = getSuperior(proxy);
				if (superior && Spanner.isFunction(superior[$SET_HANDLER])) {
					superior[$SET_HANDLER](record);
				}
			},
			deletePropertyBeforeHandler: (record) => {
				const path = [...record.path];
				path.splice(0, getPath(proxy).length);
				this.#triggerDeppDeleteWatch.call(
					proxy,
					composeKey(path.join('.'))
				);
			},
			deletePropertyHandler: (record) => {
				const path = [...record.path];
				path.splice(0, getPath(proxy).length);
				this.#triggerWatch.call(proxy, path, record);
				const superior = getSuperior(proxy);
				if (superior && Spanner.isFunction(superior[$SET_HANDLER])) {
					superior[$SET_HANDLER](record);
				}
			},
		});
		(proxy as Watcher).setWatch(watchList);
		if (Spanner.isFunction(beforeHandler)) {
			beforeHandler(proxy);
		}
		this.#triggerImmediateWatch.call(proxy);
		this.#isInit = false;
		return proxy as any;
	}

	/**
	 * 初始化
	 */
	#isInit = true;
	/**
	 * 普通的观察实体列表
	 */
	#watchEntityList: WatchEntityListMap = new Map();
	/**
	 * 立即触发的观察回调列表
	 */
	#immediateWatchCallbacks: ImmediateWatchCallbacksMap = new Map();
	/**
	 * 等待触发的立即触发的观察回调列表
	 */
	#waitImmediateWatchCallbacks: ImmediateWatchCallbacksMap = new Map();

	/**
	 * 设置单个数据
	 * @param key 键值
	 * @param value 数据值
	 * @param proxy 代理对象，可选, 默认为当前观察者
	 */
	addData(key: KeyType, value: any, proxy: ProxyObject = this): void {
		proxy[key] = value;
	}

	/**
	 * 批量设置数据
	 * @param data 数据集
	 * @param proxy 代理对象，可选, 默认为当前观察者
	 */
	setData(data: DataList = {}, proxy: ProxyObject = this): void {
		for (let i in data) {
			this.addData(i, data[i], proxy);
		}
	}

	/**
	 * 获取数据
	 * @param proxy 代理对象，可选, 默认为当前观察者
	 */
	getData(proxy: ProxyObject = this): any {
		return Spanner.clone(getTarget(proxy));
	}

	/**
	 * 为属性添加观察
	 * @param key 需要观察的属性
	 * @param value 触发的回调或选项
	 * @param proxy 需要观察属性的代理对象，可选，默认为当前观察者
	 * @returns 调用即可移除观察的函数
	 */
	addWatch(
		key: string,
		value: WatchType | WatchGroup,
		proxy: ProxyObject = this
	): RemoveWatch {
		if (Spanner.isArray(value)) {
			const removeList = [];
			(value as WatchGroup).forEach((data) => {
				const res = this.addWatch(key, data, proxy);
				if (Spanner.isFunction(res)) {
					removeList.push(res);
				}
			});
			return () => {
				removeList.forEach((handler) => handler());
			};
		}
		const data = getWatchOptions(value as WatchType);
		if (!data || typeof data.handler !== 'function') {
			console.error(
				`Uncaught ReferenceError: 'handler' must be a function`
			);
			return;
		}
		if (key === null || key === undefined || key === 'default') {
			key = 'default';
			data.deep = true;
		}
		const self = getTarget(this);
		const path = getPath(proxy);
		const newKey = composeKey(...(path as string[]), key);
		const id = Spanner.createID();
		data.handler[$WATCH_ID] = id;
		const removeList = [];
		const watchEntityList = self.#watchEntityList as WatchEntityListMap;
		if (!self.#watchEntityList.has(newKey)) {
			watchEntityList.set(newKey, new Map());
		}
		watchEntityList.get(newKey).set(id, data);
		removeList.push(() => {
			watchEntityList.get(newKey).delete(id);
		});
		if (data.immediate) {
			const immediateWatchCallbacks = self
				.#immediateWatchCallbacks as ImmediateWatchCallbacksMap;
			if (!immediateWatchCallbacks.has(newKey)) {
				immediateWatchCallbacks.set(newKey, new Map());
			}
			immediateWatchCallbacks.get(newKey).set(id, data.handler);
			removeList.push(() =>
				immediateWatchCallbacks.get(newKey).delete(id)
			);
			if (self.#isInit) {
				const waitImmediateWatchCallbacks = self
					.#waitImmediateWatchCallbacks as ImmediateWatchCallbacksMap;
				if (!waitImmediateWatchCallbacks.has(newKey)) {
					waitImmediateWatchCallbacks.set(newKey, new Map());
				}
				waitImmediateWatchCallbacks.get(newKey).set(id, data.handler);
			} else {
				const record = self.#getRecordByPath.call(
					this,
					parseKey(newKey)
				);
				if (record) {
					data.handler.call(this, record, null);
				}
			}
		}
		return () => {
			removeList.forEach((handler) => handler());
		};
	}

	/**
	 * 批量添加属性观察监听
	 * @param watchList 需要观察的属性及触发内容的列表
	 * @param proxy 需要观察属性的代理对象，可选，默认为当前观察者
	 * @returns 调用即可移除观察的函数
	 */
	setWatch(watchList: WatchList, proxy: ProxyObject = this): RemoveWatch {
		const removeList = [];
		for (let i in watchList) {
			const res = this.addWatch(i, watchList[i], proxy);
			if (Spanner.isFunction(res)) {
				removeList.push(res);
			}
		}
		return () => {
			removeList.forEach((handler) => handler());
		};
	}

	/**
	 * 获取代理对象下所有的观察列表
	 * @param proxy 代理对象，可选，默认为当前观察者
	 * @returns 观察列表
	 */
	getWatch(proxy: ProxyObject = this): WatchList {
		const self = getTarget(this);
		const fullKey = composeKey(...(getPath(proxy) as string[]));
		const hasFilter = !!fullKey;
		const watchList: WatchList = {};
		const regexp = new RegExp(
			`^${Spanner.replaceRegExpKeywords(
				fullKey
			)}[${Spanner.replaceRegExpKeywords('.[')}]`
		);
		(self.#watchEntityList as WatchEntityListMap).forEach(
			(entityList, key) => {
				if (hasFilter) {
					if (fullKey !== key && !regexp.test(key)) {
						return;
					}
				}
				const arr = [];
				entityList.forEach((data) => {
					arr.push(data);
				});
				watchList[key] = arr.length > 1 ? arr : arr[0];
			}
		);
		return watchList;
	}

	/**
	 * 根据路径获取数据记录
	 * @param path 属性路径
	 */
	#getRecordByPath(path: PathGroup = []): Record {
		if (!path || !path.length) return;
		const _path = [...path] as string[];
		const pathSize = _path.length - 1;
		const pathLast = _path[pathSize]
			.replace(/^[\'\"\`]/, '')
			.replace(/[\'\"\`]$/, '');
		_path[pathSize] = `${pathLast}$record`;
		let index = 0;
		let target = this;
		while (target && index <= pathSize) {
			target = target[_path[index]];
			index++;
		}
		return target as unknown as Record;
	}

	/**
	 * 根据路径获取数据记录历史
	 * @param path 属性路径
	 */
	#getRecordHistoryByPath(path: PathGroup = []): History {
		if (!path || !path.length) return;
		const _path = [...path] as string[];
		const pathSize = _path.length - 1;
		const pathLast = _path[pathSize]
			.replace(/^[\'\"\`]/, '')
			.replace(/[\'\"\`]$/, '');
		_path[pathSize] = `${pathLast}$recordHistory`;
		let index = 0;
		let target = this;
		while (target && index <= pathSize) {
			target = target[_path[index]];
			index++;
		}
		return target as unknown as History;
	}

	/**
	 * 触发数据观察
	 * @param path 属性路径
	 * @param record 数据记录
	 * @param bubble
	 */
	#triggerWatch(path: PathGroup = [], record: Record, bubble = null): void {
		const self = getTarget(this);
		const keyPath = [...path];
		const key = composeKey(...(keyPath as string[]));
		if (self.#watchEntityList.has(key))
			self.#watchEntityList.get(key).forEach(({ handler, deep }) => {
				if (bubble && !deep) return;
				handler.call(this, record, bubble);
			});
		if (bubble) return;
		keyPath.pop();
		while (keyPath.length) {
			self.#triggerWatch.call(
				this,
				keyPath,
				self.#getRecordByPath.call(this, keyPath),
				record
			);
			self.#triggerWatch.call(
				this,
				[...keyPath, 'default'],
				null,
				record
			);
			keyPath.pop();
		}
		self.#triggerWatch.call(this, ['default'], null, record);
	}

	/**
	 * 触发初始化观察
	 */
	#triggerImmediateWatch(): void {
		const self = getTarget(this);
		const immediateMap: TriggerItem[] = [];
		(
			self.#waitImmediateWatchCallbacks as ImmediateWatchCallbacksMap
		).forEach((callbacks, key) => {
			immediateMap.push({
				key,
				path: parseKey(key),
				callbacks,
			});
		});
		self.#waitImmediateWatchCallbacks = new Map();
		immediateMap
			.sort((a, b) => {
				return a.path.length - b.path.length;
			})
			.forEach(({ path, callbacks }) => {
				const record = self.#getRecordByPath.call(this, path);
				if (record) {
					(callbacks as ImmediateWatchCallback).forEach((callback) =>
						callback.call(this, record, null)
					);
				}
			});
	}

	/**
	 * 触发深层初始化观察
	 * 用于在创建观察者实例后新增属性触发原有已经存在的观察
	 * @param key 触发的属性值
	 */
	#triggerDeppImmediateWatch(key: string): void {
		const self = getTarget(this);
		const matchRegexp = new RegExp(
			`^${Spanner.replaceRegExpKeywords(
				key
			)}[${Spanner.replaceRegExpKeywords('.[]')}]\.+$`
		);
		const matchMap: TriggerItem[] = [];
		(self.#immediateWatchCallbacks as ImmediateWatchCallbacksMap).forEach(
			(callbacks, key) => {
				if (matchRegexp.test(key)) {
					matchMap.push({
						key: key,
						path: parseKey(key),
						callbacks,
					});
				}
			}
		);
		matchMap
			.sort((a, b) => {
				return a.path.length - b.path.length;
			})
			.forEach(({ path, callbacks }) => {
				const record: Record = self.#getRecordByPath.call(this, path);
				if (record) {
					(callbacks as ImmediateWatchCallback).forEach((callback) =>
						callback.call(this, record, null)
					);
				}
			});
	}

	/**
	 * 触发深层删除观察
	 * 用于删除对象或数组的属性时触发原有的观察
	 * @param key 触发的属性值
	 */
	#triggerDeppDeleteWatch(key: string): void {
		const self = getTarget(this);
		const matchRegexp = new RegExp(
			`^${Spanner.replaceRegExpKeywords(
				key
			)}[${Spanner.replaceRegExpKeywords('.[]')}]\.+$`
		);
		const matchMap: TriggerItem[] = [];
		(self.#watchEntityList as WatchEntityListMap).forEach(
			(callbacks, key) => {
				if (matchRegexp.test(key)) {
					matchMap.push({
						key: key,
						path: parseKey(key),
						callbacks,
					});
				}
			}
		);
		matchMap
			.sort((a, b) => {
				return b.path.length - a.path.length;
			})
			.forEach(({ key, path }) => {
				const record: Record = self.#getRecordByPath.call(this, path);
				if (record) {
					(self.#watchEntityList as WatchEntityListMap)
						.get(key)
						.forEach(({ handler }) => {
							handler.call(this, record, null);
						});
				}
			});
	}
}

/**
 * 不是代理对象时输出错误提示
 */
function isNotProxyObject() {
	console.error(`Uncaught ReferenceError: 'proxy' must be a ProxyObject`);
}

/**
 * 设置单个数据
 * @param proxy 代理对象
 * @param key 键值
 * @param value 数据值
 */
export function addData(proxy: ProxyObject, key: KeyType, value: any): void {
	const watcher = getWatcher(proxy) as Watcher;
	if (watcher) {
		watcher.addData(key, value, proxy);
	} else {
		isNotProxyObject();
	}
}

/**
 * 批量设置数据
 * @param proxy 代理对象
 * @param data 数据集
 */
export function setData(proxy: ProxyObject, data: DataList): void {
	const watcher = getWatcher(proxy) as Watcher;
	if (watcher) {
		watcher.setData(data, proxy);
	} else {
		isNotProxyObject();
	}
}

/**
 * 获取数据
 * @param proxy 代理对象
 */
export function getData(proxy: ProxyObject): any {
	const watcher = getWatcher(proxy) as Watcher;
	if (watcher) {
		return watcher.getData(proxy);
	} else {
		isNotProxyObject();
	}
}

/**
 * 为属性添加观察
 * @param proxy 需要观察属性的代理对象
 * @param key 需要观察的属性
 * @param value 触发的回调或选项
 * @returns 调用即可移除观察的函数
 */
export function addWatch(
	proxy: ProxyObject,
	key: string,
	value: WatchType | WatchGroup
): RemoveWatch {
	const watcher = getWatcher(proxy) as Watcher;
	if (watcher) {
		return watcher.addWatch(key, value, proxy);
	} else {
		isNotProxyObject();
	}
}

/**
 * 批量添加属性观察监听
 * @param proxy 需要观察属性的代理对象
 * @param watchList 需要观察的属性及触发内容的列表
 * @returns 调用即可移除观察的函数
 */
export function setWatch(proxy: ProxyObject, value: WatchList): RemoveWatch {
	const watcher = getWatcher(proxy) as Watcher;
	if (watcher) {
		return watcher.setWatch(value, proxy);
	} else {
		isNotProxyObject();
	}
}

/**
 * 获取代理对象下所有的观察列表
 * @param proxy 代理对象
 * @returns 观察列表
 */
export function getWatch(proxy: ProxyObject): WatchList {
	const watcher = getWatcher(proxy) as Watcher;
	if (watcher) {
		return watcher.getWatch(proxy);
	} else {
		isNotProxyObject();
	}
}
