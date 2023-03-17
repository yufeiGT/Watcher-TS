import { Watcher } from '../Watcher';

import { Record, RecordChangeHandler } from './Record';

/**
 * 路径
 */
export type Path = string | number;

/**
 * 键值类型
 */
export type KeyType = string | number | symbol;

/**
 * 路径组
 */
export type PathGroup = Path[];

/**
 * 判断是否为 保护/只读 的调用函数
 */
export type GetterCallHandler = (attr: string | number | symbol) => boolean;

/**
 * 判断是否为 保护/只读 的句柄函数
 */
export type GetterIsHandler = (resolve: GetterCallHandler) => void;

/**
 * 代理对象
 */
export type ProxyObject = {} | [];

/**
 * 代理选项
 */
export interface ProxyOptions {
	/**
	 * 当前代理路径
	 */
	currentPath?: PathGroup;
	/**
	 * 上级代理
	 */
	superior?: ProxyObject | null;
	/**
	 * 上级是否为新增加的属性
	 */
	superiorIsNew?: boolean;
	/**
	 * 上级是否为受保护属性
	 */
	superiorIsProtect?: boolean;
	/**
	 * 上级是否为只读属性
	 */
	superiorIsReadonly?: boolean;
	/**
	 * 所属的观察者实例
	 */
	watcher?: Watcher | null;
	/**
	 * 赋值钩子
	 */
	setHandler?: RecordChangeHandler | null;
	/**
	 * 删除前钩子
	 */
	deletePropertyBeforeHandler?: RecordChangeHandler | null;
	/**
	 * 删除钩子
	 */
	deletePropertyHandler?: RecordChangeHandler | null;
}

/**
 * 代理数据集
 */
export interface ProxyDataSet {
	/**
	 * 代理对象已通过保护认证
	 */
	proxyProtectAuthorization: boolean;
	/**
	 * 代理对象已被保护
	 */
	proxyIsProtect: boolean;
	/**
	 * 代理为只读状态
	 */
	proxyIsReadonly: boolean;
	/**
	 * 子代理对象列表
	 */
	childProxyMap: Map<KeyType, ProxyObject>;
	/**
	 * 包含新增的子代理对象列表
	 */
	childProxyIsNewMap: Map<KeyType, boolean>;
	/**
	 * 子代理对象保护列表
	 */
	childProxyProtectMap: Map<KeyType, boolean>;
	/**
	 * 子代理对象只读列表
	 */
	childProxyReadonlyMap: Map<KeyType, boolean>;
}

/**
 * 观察回调句柄
 */
export type WatchHandler = (record: Record, bubble?: Record | null) => void;

/**
 * 观察选项
 */
export interface WatchOptions {
	/**
	 * 回调句柄
	 */
	handler: WatchHandler;
	/**
	 * 立即触发
	 */
	immediate?: boolean;
	/**
	 * 深度观察
	 */
	deep?: boolean;
}

export type WatchType = WatchHandler | WatchOptions;
