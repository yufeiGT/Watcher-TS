import { PathGroup } from '../Constants';

/**
 * 将字符串解析为执行路径
 * @param key 需要解析的字符串
 * @param deep 深解析
 */
export function parseKey(key: string = '', deep: boolean = true): PathGroup {
	if (typeof key !== 'string') key = `${key}`;
	const path: PathGroup = [];
	if (key.length)
		((str) => {
			let chats = '';
			let lNum = 0;
			let rNum = 0;
			let sNum = 0;
			let mNum = 0;
			while (str.length) {
				const [chat] = str;
				str = str.substring(1);
				if (deep) {
					if (chat == "'" && !mNum) {
						path.push(chats);
						chats = '';
						if (sNum) {
							sNum = 0;
						} else {
							sNum++;
						}
						continue;
					} else if (chat == '"' && !sNum) {
						path.push(chats);
						chats = '';
						if (mNum) {
							mNum = 0;
						} else {
							mNum++;
						}
						continue;
					}
				}
				if (sNum || mNum) {
					chats += chat;
				} else {
					if (chat == '.') {
						path.push(chats);
						chats = '';
					} else if (chat == '[') {
						if (!lNum) {
							path.push(chats);
							chats = '';
						} else {
							chats += chat;
						}
						lNum++;
					} else if (chat == ']') {
						rNum++;
						if (lNum == rNum) {
							lNum = 0;
							rNum = 0;
						} else {
							chats += chat;
						}
					} else {
						chats += chat;
					}
				}
			}
			path.push(chats);
		})(key);
	return path.filter((item) => (item as string).length);
}

/**
 * 将多个字符组合为可执行的 JavaScript 访问对象代码
 * @param params 多个字符串
 */
export function composeKey(...params: string[]): string {
	if (!params.length) return '';
	if (params.length == 1) {
		let key = '';
		parseKey(params[0]).forEach((item: string) => {
			item = item.replace(/^[\'\"\`]/, '').replace(/[\'\"\`]$/, '');
			if (/^\d/.test(item) || /\-/.test(item)) {
				return (key = `${key}[${
					isNaN(item as unknown as number) ? `'${item}'` : item
				}]`);
			}
			if (!key) {
				return (key = item);
			}
			key = `${key}.${item}`;
		});
		return key.replace(/\.$/, '');
	}
	return composeKey(params.map((item) => composeKey(item)).join('.'));
}

/**
 * 将字符串编码为可执行的 JavaScript 访问对象代码
 * @param {String} key
 * @returns
 */
export function encodeToKey(key = ''): string {
	return composeKey(...(parseKey(key) as string[]));
}
