function html(data, level = 0) {
	try { data = JSON.parse(data) } catch { }
	let typ = typeof (data);
	if (Array.isArray(data)) typ = 'array';
	if (data === null) typ = 'null';
	let q = '<c>"</c>';
	// let output = '';
	let len = JSON.stringify(data).length;
	switch (typ) {
		case 'object':
		case 'array':
			// console.log('keys', Object.keys(data))
			let c1 = typ == 'object' ? q : '';
			let keys = Object.keys(data)
			// let c2 = typ == 'object' ? '<c>:</c>' : '';
			return `<block class='${typ} ${len < 50 ? 'short' : 'long'}'>
				<c>${typ == 'object' ? '{' : '['}</c>
				${keys.map((key, i) => `<kv>${typ == 'object' ? `${c1}<key>${key}</key>${c1}<c>:</c>` : ''}${html(data[key], level + 1)}${i < keys.length - 1 ? '<c>,</c>' : ''}</kv>`).join('')}
				<c>${typ == 'object' ? '}' : ']'}</c>
				</block>`;

		default:
			let c = typ == 'string' ? q : '';
			return c + `<value class='${typ} ${data}'>${data}</value>` + c;

	}

}

export function converter(data) {
	// console.log('convert', data)
	let string = html(data)
	// console.log('html', string);
	return new DOMParser().parseFromString(string,'text/html').firstChild;
}

export const style = `
.array.short{display: inline-block;}
.array.short>kv{display: inline-block; margin-right: 3em;}
`

