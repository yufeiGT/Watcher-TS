import * as Constants from '../Constants';

const ConstValues = Object.values(Constants) as symbol[];

type SuperiorParams = [Constants.ProxyObject, Constants.PathGroup];

/**
 * 赋值 Symbol 时检验是否为系统功能
 * @param proxyOptions 代理选项
 * @param proxyDataSet 代理数据距
 * @param key 赋值属性名
 * @param value 值
 * @returns
 */
export default function setterSymbol(
	proxyOptions: Constants.ProxyOptions,
	proxyDataSet: Constants.ProxyDataSet,
	key: symbol,
	value: any
): boolean {
	if (key === Constants.$SET_PROXY_SUPERIOR) {
		const [s, p] = value as SuperiorParams;
		proxyOptions.superior = s;
		proxyOptions.currentPath = p;
		return true;
	}
	if (key === Constants.$SET_PROTECT) {
		if (value === null || value === undefined) {
			proxyDataSet.proxyIsProtect = true;
		} else {
			proxyDataSet.childProxyProtectMap.set(value, true);
		}
		return true;
	}
	if (key === Constants.$IS_PROTECT) {
		(value as Constants.GetterIsHandler)((attr) =>
			proxyDataSet.childProxyProtectMap.has(attr)
		);
		return true;
	}
	if (key === Constants.$PROTECT_AUTHORIZATION) {
		proxyDataSet.proxyProtectAuthorization = value;
		return true;
	}
	if (key === Constants.$SET_READONLY) {
		if (value === null || value === undefined) {
			proxyDataSet.proxyIsReadonly = true;
		} else {
			proxyDataSet.childProxyReadonlyMap.set(value, true);
		}
		return true;
	}
	if (key === Constants.$IS_READONLY) {
		value((attr) => proxyDataSet.childProxyReadonlyMap.has(attr));
		return true;
	}
	if (ConstValues.includes(key)) {
		console.warn(`Assignment to readonly variable`);
		return true;
	}
	return false;
}
