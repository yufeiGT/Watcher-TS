import * as Spanner from '@~crazy/spanner';

import { WatchHandler, WatchOptions, WatchType } from '../Constants';

export default function getWatchOptions(value: WatchType): WatchOptions {
	const isObj = Spanner.isObject(value);
	const isFun = Spanner.isFunction(
		isObj ? (value as WatchOptions).handler : value
	);
	if (!isFun && !isObj) return;
	if (isObj) {
		value = value as WatchOptions;
		return {
			handler: value.handler,
			immediate: !!value.immediate,
			deep: !!value.deep,
		};
	}
	return {
		handler: value as WatchHandler,
		immediate: false,
		deep: false,
	};
}
