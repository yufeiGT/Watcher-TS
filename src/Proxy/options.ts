import * as Spanner from '@~crazy/spanner';

import { Watcher } from '../Watcher';

import { PathGroup, RecordChangeHandler, ProxyOptions } from '../Constants';

export const defaultOptions: ProxyOptions = {
	currentPath: [],
	superior: null,
	superiorIsNew: false,
	superiorIsProtect: false,
	superiorIsReadonly: false,
	watcher: null,
	setHandler: null,
	deletePropertyBeforeHandler: null,
	deletePropertyHandler: null,
};

export function getOptions(options: ProxyOptions): ProxyOptions {
	return Spanner.merge(defaultOptions, options);
}
