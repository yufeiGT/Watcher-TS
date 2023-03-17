import { Watcher } from '../Watcher';
import { Recorder } from '../Recorder';

import {
	getWatcher,
	getRootWatcher,
	isProtected,
	isReadonly,
	isProtectAuthorization,
} from './operation';

import {
	$IS_PROXY,
	$TO_TARGET,
	$GTE_RECORDER,
	$GET_PATH,
	$GET_SUPERIOR,
	$GET_WATCHER,
	$GET_ROOT_WATCHER,
	$SET_HANDLER,
	$DELETE_PROPERTY_BEFORE_HANDLER,
	$DELETE_PROPERTY_HANDLER,
	$PROTECT_AUTHORIZATION,
	$IS_PROTECT,
	$IS_READONLY,
	ProxyOptions,
	ProxyObject,
	ProxyDataSet,
} from '../Constants';

/**
 * 赋值 Symbol 时检验是否为系统功能
 * @param proxy 代理对象
 * @param proxyOptions 代理选项
 * @param proxyDataSet 代理数据距
 * @param recorder 记录者
 * @param target 模板对象
 * @param key 赋值属性名
 * @returns 返回 undefined 表示为不是系统功能
 */
export default function getterSymbol(
	proxy: ProxyObject,
	proxyOptions: ProxyOptions,
	proxyDataSet: ProxyDataSet,
	recorder: Recorder,
	target: {},
	key: symbol
): any {
	if (key === $IS_PROXY) {
		return true;
	}
	if (key === $TO_TARGET) {
		return target;
	}
	if (key === $GTE_RECORDER) {
		return recorder;
	}
	if (key === $GET_PATH) {
		return proxyOptions.currentPath;
	}
	if (key === $GET_SUPERIOR) {
		return proxyOptions.superior;
	}
	if (key === $GET_WATCHER) {
		if (proxy instanceof Watcher) {
			return proxy;
		}
		if (proxyOptions.superior) {
			return getWatcher(proxyOptions.superior);
		}
		return;
	}
	if (key === $GET_ROOT_WATCHER) {
		if (proxyOptions.superior) {
			return getRootWatcher(proxyOptions.superior);
		}
		return proxy;
	}
	if (key === $SET_HANDLER) {
		return proxyOptions.setHandler;
	}
	if (key === $DELETE_PROPERTY_BEFORE_HANDLER) {
		return proxyOptions.deletePropertyBeforeHandler;
	}
	if (key === $DELETE_PROPERTY_HANDLER) {
		return proxyOptions.deletePropertyHandler;
	}
	if (key === $IS_PROTECT) {
		if (proxyDataSet.proxyIsProtect) {
			return true;
		}
		if (proxyOptions.superior) {
			return isProtected(
				proxyOptions.superior,
				proxyOptions.currentPath[proxyOptions.currentPath.length - 1]
			);
		}
		return false;
	}
	if (key === $PROTECT_AUTHORIZATION) {
		if (proxyDataSet.proxyProtectAuthorization) {
			return true;
		}
		if (proxyOptions.superior) {
			return isProtectAuthorization(proxyOptions.superior);
		}
		return false;
	}
	if (key === $IS_READONLY) {
		if (proxyDataSet.proxyIsReadonly) {
			return true;
		}
		if (proxyOptions.superior) {
			return isReadonly(
				proxyOptions.superior,
				proxyOptions.currentPath[proxyOptions.currentPath.length - 1]
			);
		}
		return false;
	}
}
