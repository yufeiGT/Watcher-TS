import * as Spanner from '@~crazy/spanner';

import { Watcher } from '../Watcher';
import { Recorder } from '../Recorder';

import {
	$SET_PROXY_SUPERIOR,
	ProxyObject,
	ProxyOptions,
	ProxyDataSet,
	PathGroup,
} from '../Constants';

import { getOptions } from './options';
import { recursiveUpUpdate, recursiveDeepUpdate } from './update';
import {
	isReadonly,
	isProtected,
	getTarget,
	isProtectAuthorization,
} from './operation';
import setterSymbol from './setterSymbol';
import getterSymbol from './getterSymbol';

/**
 * 设置为(更新数据记录)正则
 */
const ChangeRegExp = /\$\$_w_change\$\$$/;
/**
 * 设置为(移除数据记录)正则
 */
const DeleteRegExp = /\$\$_w_delete\$\$$/;

/**
 * 获取数据记录正则
 */
const RecordRegExp = /\$record$/;
/**
 * 获取数据历史记录表正则
 */
const recordHistoryRegExp = /\$recordHistory$/;

/**
 * 为目标构建代理对象
 * @param target 需要构建的目标
 * @param options 选项
 * @returns
 */
function buildProxy(target: {} = {}, options: ProxyOptions = {}): ProxyObject {
	const isArray = Spanner.isArray(target);
	const isObject = Spanner.isObject(target);
	if (!isArray && !isObject) {
		console.warn(`The target type needs to be 'array' or 'object'`);
		return;
	}
	let proxyOptions = getOptions(options);
	const dataSet: ProxyDataSet = {
		proxyProtectAuthorization: false,
		proxyIsProtect: !!proxyOptions.superiorIsProtect,
		proxyIsReadonly: !!proxyOptions.superiorIsReadonly,
		childProxyMap: new Map(),
		childProxyIsNewMap: new Map(),
		childProxyProtectMap: new Map(),
		childProxyReadonlyMap: new Map(),
	};
	const proxy = new Proxy(target, {
		set(target, key, value) {
			if (Spanner.isSymbol(key)) {
				if (setterSymbol(proxyOptions, dataSet, key as symbol, value)) {
					return true;
				}
				Reflect.set(target, key, value);
			} else {
				key = key as string;
				if (ChangeRegExp.test(key)) {
					const targetKey = key.replace(ChangeRegExp, '');
					recorder.change(targetKey, value);
					return true;
				}
				if (RecordRegExp.test(key) || isReadonly(proxy, key)) {
					console.warn(`Assignment to readonly variable '${key}'`);
					return true;
				}
				if (isProtected(proxy, key) && !isProtectAuthorization(proxy)) {
					console.warn(`Assignment to protection variable '${key}'`);
					return true;
				}
				if (!(value instanceof Watcher)) {
					value = getTarget(value);
				}
				const oldValue = Reflect.get(target, key);
				if (oldValue === value) {
					return true;
				}
				let isNew = false;
				if (!(key in target)) {
					isNew = !recorder.has(key);
					dataSet.childProxyIsNewMap.set(key, true);
				}
				const dataObject =
					Spanner.isPlainObject(oldValue) ||
					Spanner.isArray(oldValue);
				if (dataObject) {
					recursiveDeepUpdate(proxy[key], oldValue);
					if (
						Spanner.isFunction(
							proxyOptions.deletePropertyBeforeHandler
						)
					) {
						proxyOptions.deletePropertyBeforeHandler(
							recorder.get(key)
						);
					}
				}
				if (dataSet.childProxyMap.has(key)) {
					dataSet.childProxyMap.delete(key);
				}
				if (oldValue instanceof Watcher) {
					oldValue[$SET_PROXY_SUPERIOR] = [null, []];
				}
				if (!isNew && !recorder.has(key)) {
					recorder.get(key);
				}
				const path: PathGroup = [...proxyOptions.currentPath, key];
				recorder.set(
					key,
					dataObject ? Spanner.clone(value) : value,
					path,
					isNew
				);
				Reflect.set(target, key, value);
				const record = recorder.get(key);
				if (proxyOptions.superior) {
					recursiveUpUpdate(
						proxyOptions.superior,
						proxyOptions.currentPath,
						record
					);
				}
				if (Spanner.isFunction(proxyOptions.setHandler)) {
					proxyOptions.setHandler(record);
				}
			}
			return true;
		},
		get(target, key) {
			if (Spanner.isSymbol(key)) {
				const res = getterSymbol(
					proxy,
					proxyOptions,
					dataSet,
					recorder,
					target,
					key as symbol
				);
				if (res !== undefined) {
					return res;
				}
				return Reflect.get(target, key);
			}
			key = key as string;
			if (!(key in target)) {
				if (RecordRegExp.test(key)) {
					return recorder.get(key.replace(RecordRegExp, ''));
				}
				if (recordHistoryRegExp.test(key)) {
					return recorder.getHistory(
						key.replace(recordHistoryRegExp, '')
					);
				}
				if (DeleteRegExp.test(key)) {
					const targetKey = key.replace(DeleteRegExp, '');
					recorder.delete(targetKey);
					return true;
				}
			}
			const value = Reflect.get(target, key);
			if (value instanceof Watcher) {
				if (dataSet.childProxyMap.has(key)) {
					return dataSet.childProxyMap.get(key);
				}
				value[$SET_PROXY_SUPERIOR] = [
					proxy,
					[...proxyOptions.currentPath, key],
				];
				return value;
			}
			if (Spanner.isPlainObject(value) || Spanner.isArray(value)) {
				if (dataSet.childProxyMap.has(key)) {
					return dataSet.childProxyMap.get(key);
				}
				const _proxy = buildProxy(value, {
					superior: proxy,
					currentPath: [...proxyOptions.currentPath, key],
					superiorIsNew: dataSet.childProxyIsNewMap.has(key),
					superiorIsProtect: dataSet.proxyIsProtect,
					superiorIsReadonly: dataSet.proxyIsReadonly,
					watcher: proxyOptions.watcher,
					setHandler: proxyOptions.setHandler,
					deletePropertyBeforeHandler:
						proxyOptions.deletePropertyBeforeHandler,
					deletePropertyHandler: proxyOptions.deletePropertyHandler,
				});
				dataSet.childProxyMap.set(key, _proxy);
				return _proxy;
			}
			return value;
		},
		deleteProperty(target, key) {
			key = key as string;
			if (isProtected(proxy, key)) {
				console.warn(
					`Deleting protection variables '${key}' is prohibited`
				);
				return false;
			}
			if (isReadonly(proxy, key)) {
				console.warn(
					`Deleting readonly variables '${key}' is prohibited`
				);
				return false;
			}
			if (!recorder.delete(key)) return false;
			const record = recorder.get(key);
			const oldValue = Reflect.get(target, key);
			if (Spanner.isPlainObject(oldValue) || Spanner.isArray(oldValue)) {
				recursiveDeepUpdate(proxy[key], oldValue);
				if (
					Spanner.isFunction(proxyOptions.deletePropertyBeforeHandler)
				) {
					proxyOptions.deletePropertyBeforeHandler(record);
				}
			}
			const res = Reflect.deleteProperty(target, key);
			if (proxyOptions.superior) {
				recursiveUpUpdate(
					proxyOptions.superior,
					proxyOptions.currentPath,
					record
				);
			}
			if (Spanner.isFunction(proxyOptions.deletePropertyHandler)) {
				proxyOptions.deletePropertyHandler(record);
			}
			return res;
		},
	});
	const recorder: Recorder = new Recorder(proxy, proxyOptions.superiorIsNew);
	return proxy;
}

export default buildProxy;
