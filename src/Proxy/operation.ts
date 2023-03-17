import * as Spanner from '@~crazy/spanner';

import { Watcher } from '../Watcher';
import { Recorder } from '../Recorder';

import {
	$IS_PROXY,
	$TO_TARGET,
	$GTE_RECORDER,
	$GET_PATH,
	$GET_SUPERIOR,
	$GET_WATCHER,
	$GET_ROOT_WATCHER,
	$IS_PROTECT,
	$IS_READONLY,
	$SET_PROTECT,
	$PROTECT_AUTHORIZATION,
	$SET_READONLY,
	ProxyObject,
	PathGroup,
	GetterIsHandler,
} from '../Constants';

/**
 * 判读目标是否为代理对象(ProxyObject)
 * @param target 需要判断的目标
 */
export function isProxy(target: any): boolean {
	return target && target[$IS_PROXY] === true;
}

/**
 * 获取原始目标
 * @param proxy 代理对象
 */
export function getTarget(proxy: ProxyObject): any {
	return (proxy && proxy[$TO_TARGET]) || proxy;
}

/**
 * 获取记录者
 * @param proxy 代理对象
 */
export function getRecorder(proxy: ProxyObject): Recorder {
	return proxy && proxy[$GTE_RECORDER];
}

/**
 * 获取代理对象的路径
 * @param proxy 代理对象
 */
export function getPath(proxy: ProxyObject): PathGroup {
	return proxy && proxy[$GET_PATH];
}

/**
 * 获取上级代理对象
 * @param proxy 代理对象
 */
export function getSuperior(proxy: ProxyObject): ProxyObject {
	return proxy && proxy[$GET_SUPERIOR];
}

/**
 * 获取所属的观察者实例
 * @param proxy 代理对象
 */
export function getWatcher(proxy: ProxyObject): Watcher {
	return proxy && proxy[$GET_WATCHER];
}

/**
 * 获取根观察者实例
 * @param proxy 代理对象
 */
export function getRootWatcher(proxy: ProxyObject): Watcher {
	return proxy && proxy[$GET_ROOT_WATCHER];
}

/**
 * 是否为受保护的属性
 * @param proxy 需要判断的代理对象
 * @param attr 需要判断的代理对象下的属性，可选，不传此参数判断整个代理对象
 */
export function isProtected(
	proxy: ProxyObject,
	attr?: string | number
): boolean {
	if (!isProxy(proxy)) return false;
	if (proxy[$IS_PROTECT] === true) return true;
	let res;
	if (attr !== undefined) {
		proxy[$IS_PROTECT] = ((resolve) => {
			res = resolve(attr);
		}) as GetterIsHandler;
	}
	return !!res;
}

/**
 * 是否为只读的属性
 * @param proxy 需要判断的代理对象
 * @param attr 需要判断的代理对象下的属性，可选，不传此参数判断整个代理对象
 */
export function isReadonly(
	proxy: ProxyObject,
	attr?: string | number
): boolean {
	if (!isProxy(proxy)) return false;
	if (proxy[$IS_READONLY] === true) return true;
	let res;
	if (attr !== undefined) {
		proxy[$IS_READONLY] = ((resolve) => {
			res = resolve(attr);
		}) as GetterIsHandler;
	}
	return !!res;
}

export type ProtectSetterHandler = (target: ProxyObject) => void;
export type ProtectSetter = (handler: ProtectSetterHandler) => void;

type ProtectParams = [string | number, boolean];

/**
 * 保护代理对象
 * @param proxy 需要保护的代理对象
 * @param attr 需要保护代理对象下的属性，可选，不传此参数保护整个代理对象
 * @returns 可以对保护对象赋值的函数
 */
function protect(proxy: ProxyObject, attr?: string | number): ProtectSetter;
function protect(
	proxy: ProxyObject,
	attr: string | number,
	noAttr: boolean
): ProtectSetter;
function protect(proxy: ProxyObject, ...params): ProtectSetter {
	if (!isProxy(proxy)) {
		console.warn(`The protected object is not a proxy object`);
		return;
	}

	let attr: string | number;
	let noAttr: boolean = false;
	if (params.length === 2) {
		const [a, n] = params as ProtectParams;
		attr = a;
		noAttr = n;
	} else {
		attr = params[0];
	}

	if (attr === undefined) {
		const superior = getSuperior(proxy);
		if (superior) {
			const path = getPath(proxy);
			return protect(superior, path[path.length - 1], true);
		}
	}
	proxy[$SET_PROTECT] = attr;
	return (handler: ProtectSetterHandler) => {
		if (!Spanner.isFunction(handler)) return;
		const target = noAttr ? (proxy[attr] as ProxyObject) : proxy;
		target[$PROTECT_AUTHORIZATION] = true;
		handler(target);
		target[$PROTECT_AUTHORIZATION] = false;
	};
}
export { protect };

/**
 * 设置代理对象为只读
 * @param proxy
 * @param attr
 */
export function readonly(proxy: ProxyObject, attr?: string | number): void {
	if (!isProxy(proxy)) {
		console.warn(`The readonly object is not a proxy object`);
		return;
	}
	if (attr === undefined) {
		const superior = getSuperior(proxy);
		if (superior) {
			const path = getPath(proxy);
			return readonly(superior, path[path.length - 1]);
		}
	}
	proxy[$SET_READONLY] = attr;
}

/**
 * 代理对象是否已通过保护认证
 * @param proxy 代理对象
 */
export function isProtectAuthorization(proxy: ProxyObject): boolean {
	return proxy && proxy[$PROTECT_AUTHORIZATION] === true;
}
