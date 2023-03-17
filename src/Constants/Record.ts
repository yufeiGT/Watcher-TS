import { Path, PathGroup } from './Watch';

/**
 * 记录类型
 *
 * @param Add 添加属性
 * @param Update 更新属性
 * @param Remove 属性已经移除
 */
export type RecordType = 'Add' | 'Update' | 'Remove';

/**
 * 数据记录
 */
export interface Record {
	/**
	 * 记录生成的时间戳
	 */
	timestamp: number;
	/**
	 * 当前记录属性行为类型
	 */
	type: RecordType;
	/**
	 * 数据路径
	 */
	path: PathGroup;
	/**
	 * 改变的属性名
	 */
	key: Path;
	/**
	 * 是否为初始化后新增的属性
	 * （在初始后未改变过的数据） 和 （之后新增的属性） 的 type 类型都是 Add
	 * 特意添加此属性用于识别
	 */
	isNew: boolean;
	/**
	 * 是否更改过此属性，修改和删除都会为 true
	 */
	hasChange: boolean;
	/**
	 * 初次赋值的原始值
	 */
	originValue: any;
	/**
	 * 上一次的值，初始化是为 undefined
	 */
	oldValue: any;
	/**
	 * 当前值
	 */
	value: any;
	/**
	 * 存在此属性代表此记录为冒泡触发的，并不是当前记录触发的
	 * bubble 表示原始修改的属性
	 */
	bubble?: Record;
}

/**
 * 属性记录改变句柄
 */
export type RecordChangeHandler = (record: Record) => void;

/**
 * 数据记录历史列表
 */
export type History = Record[];
