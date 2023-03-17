import * as Spanner from '@~crazy/spanner';

import { ProxyObject, PathGroup, Record, History, KeyType } from './Constants';

import { isProxy, getTarget, getPath } from './Proxy';
import { Path } from './Constants/Watch';

/**
 * 记录者
 */
export class Recorder {
	/**
	 *
	 * @param proxy 代理对象
	 * @param isNew 是否为初始化后新增
	 */
	constructor(proxy: ProxyObject, isNew: boolean = false) {
		if (!isProxy(proxy)) {
			console.error(`Uncaught SyntaxError: proxy must be a ProxyObject`);
			return;
		}
		this.#proxy = proxy;
		this.#isNew = isNew;
	}

	/**
	 * 代理对象
	 */
	#proxy: ProxyObject;
	/**
	 * 是否为初始化后新增
	 */
	#isNew: boolean;
	/**
	 * 记录历史地图
	 */
	#recordHistoryMap: Map<KeyType, History> = new Map();

	/**
	 * 是否包含记录内容
	 * @param key 数据键值
	 * @returns
	 */
	has(key: KeyType): boolean {
		return this.#recordHistoryMap.has(key);
	}

	/**
	 * 设置新的属性值
	 * @param key 数据键值
	 * @param value 数据值
	 * @param path 路径
	 * @param isNew 是否为初始化后新增
	 */
	set(
		key: KeyType,
		value: any,
		path: PathGroup = [],
		isNew: boolean = false
	): Record {
		const has = this.has(key);
		const record = has
			? {
					...this.get(key),
			  }
			: this.#getTemplate(key, value, path, !!(this.#isNew || isNew));
		delete record.bubble;
		if (has) {
			record.timestamp = Date.now();
			record.type = record.type === 'Remove' ? 'Add' : 'Update';
			record.hasChange = value !== record.originValue;
			record.oldValue = record.value;
			record.value = value;
		}
		Object.freeze(record);
		this.#addRecordToHistory(key, record);
		return record;
	}

	/**
	 * 移除属性值
	 * @param key 数据键值
	 */
	delete(key: KeyType): Record {
		const record = {
			...this.get(key),
		};
		if (!record) return;
		record.timestamp = Date.now();
		record.type = 'Remove';
		record.hasChange = !record.isNew;
		record.oldValue = record.value;
		record.value = undefined;
		Object.freeze(record);
		this.#addRecordToHistory(key, record);
		return record;
	}

	/**
	 * 子级数据值发生改变
	 * @param key 发生改变的数据键值
	 * @param bubble 原始发生改变的数据记录
	 * @returns
	 */
	change(key: KeyType, bubble?: Record) {
		const record = {
			...this.get(key),
		};
		if (!record) return;
		if (!record.isNew) {
			record.hasChange = true;
		}
		record.bubble = bubble;
		Object.freeze(record);
		this.#addRecordToHistory(key, record);
	}

	/**
	 * 获取最后一次修改的记录
	 * @param key 数据键值
	 */
	get(key: KeyType): Record {
		let history = this.getHistory(key);
		return history && history[history.length - 1];
	}

	/**
	 * 获取历史列表
	 * @param key 数据键值
	 */
	getHistory(key: KeyType): History {
		let history = this.#recordHistoryMap.get(key);
		if (!history) {
			if (!(key in this.#proxy)) return;
			return [
				this.set(key, getTarget(this.#proxy[key]), [
					...getPath(this.#proxy),
					key as Path,
				]),
			];
		}
		return history;
	}

	/**
	 * 添加记录到历史
	 * @param key 数据键值
	 * @param record 数据记录
	 */
	#addRecordToHistory(key: KeyType, record: Record): void {
		if (!this.has(key)) {
			this.#recordHistoryMap.set(key, []);
		}
		const history = this.#recordHistoryMap.get(key);
		history.push(record);
	}

	/**
	 * 获取记录模板
	 * @param key 数据键值
	 * @param value 数据值
	 * @param path 路径
	 * @param isNew 是否为新增
	 * @returns
	 */
	#getTemplate(
		key: KeyType,
		value: any,
		path: PathGroup,
		isNew: boolean
	): Record {
		return {
			timestamp: Date.now(),
			type: 'Add',
			path,
			key: key as Path,
			isNew,
			hasChange: false,
			originValue: value,
			oldValue: undefined,
			value,
		};
	}
}
