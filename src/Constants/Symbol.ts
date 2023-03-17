/**
 * 是一个代理对象
 */
export const $IS_PROXY = Symbol('is proxy');
/**
 * 代理转换为普通对象
 */
export const $TO_TARGET = Symbol('proxy -> target');
/**
 * 获取记录者
 */
export const $GTE_RECORDER = Symbol('get recorder');
/**
 * 获取代理路径
 */
export const $GET_PATH = Symbol('get proxy path');
/**
 * 获取代理上级对象
 */
export const $GET_SUPERIOR = Symbol('get proxy superior');
/**
 * 获取观察者对象
 */
export const $GET_WATCHER = Symbol('get proxy watcher');
/**
 * 获取根观察者对象
 */
export const $GET_ROOT_WATCHER = Symbol('get proxy root watcher');
export const $CHANGE_AUTH = Symbol('proxy change auth');
/**
 * 设置属性句柄
 */
export const $SET_HANDLER = Symbol('proxy set handler');
/**
 * 移除属性句柄
 */
export const $DELETE_PROPERTY_BEFORE_HANDLER = Symbol(
	'proxy deleteProperty before handler'
);
/**
 * 获取移除属性句柄
 */
export const $DELETE_PROPERTY_HANDLER = Symbol('proxy deleteProperty handler');
/**
 * 设置上级对象
 */
export const $SET_PROXY_SUPERIOR = Symbol('set proxy superior');
/**
 * 设置为受保护对象
 */
export const $SET_PROTECT = Symbol('set proxy protect');
/**
 * 是受保护的对象
 */
export const $IS_PROTECT = Symbol('check proxy is protect');
/**
 * 受保护赋值认证
 */
export const $PROTECT_AUTHORIZATION = Symbol('proxy protect authorization');
/**
 * 设置为只读对象
 */
export const $SET_READONLY = Symbol('set proxy readonly');
/**
 * 是只读对象
 */
export const $IS_READONLY = Symbol('check proxy is readonly');
/**
 * 观察编号
 */
export const $WATCH_ID = Symbol('watch id');
