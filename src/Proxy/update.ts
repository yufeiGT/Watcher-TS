import * as Spanner from '@~crazy/spanner';

import { ProxyObject, PathGroup, Record } from '../Constants';

import { getSuperior } from './operation';

/**
 * 递归向上更新
 * @param proxy 发生变化的代理对象
 * @param path 代理对象路径
 * @param record 数据记录
 */
export function recursiveUpUpdate(
	proxy: ProxyObject,
	path: PathGroup,
	record: Record
): void {
	const _path = [...path] as PathGroup;
	let target = proxy;
	while (target) {
		target[`${_path[_path.length - 1]}$$_w_change$$`] = record;
		target = getSuperior(target);
		_path.pop();
	}
}

/**
 * 递归向下更新
 * @param proxy 发生变化的代理对象，可选
 * @param value 需要更新的值，可选
 */
export function recursiveDeepUpdate(proxy: ProxyObject, value: any): void {
	const isObj = Spanner.isPlainObject(value);
	if (!isObj && !Spanner.isArray(value)) return;
	if (isObj) {
		for (let key in value) {
			proxy[`${key}$$_w_delete$$`];
			recursiveDeepUpdate(proxy[key], value[key]);
		}
	} else {
		value.forEach((value, key) => {
			proxy[`${key}$$_w_delete$$`];
			recursiveDeepUpdate(proxy[key], value);
		});
	}
}
