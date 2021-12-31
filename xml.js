// function tag(name)
function html2(node, level = 0) {
	// if(node.tagName=='xxxxx') 
	let output = '';
	if (node.nodeType == 3) {
		if (node.nodeValue.trim()) return `<kv><value>${node.nodeValue}</value></kv>`
		else return '';
	}

	let children = Array.from(node.childNodes);
	let attributes = Array.from(node.attributes);
	let ouput = `<block class='tag>\n`
	output += `<tag><c>&lt;</c><name>${node.tagName}</name>`
	if (attributes.length) {
		output += `\n<block class='attributes'>\n`;
		output += attributes.map(attr => `<kv><key>${attr.name}</key><c>="</c><value>${attr.value}</value><c>"</c></kv>\n`).join('')
		output += `</block>\n`
	}
	if (children.length) {
		output += `<c>&gt;</c></tag>\n` //close opening tag
		output += `<block class='children'>\n`;
		output += children.map(child => html(child)).join('')
		output += `</block>\n`
		output += `<tag><c>&lt;/</c><name>${node.tagName}</name><c>&gt;</c></tag>\n` // add full-closing-tag
	} else {
		output += `<c>/&gt;</c></tag>` // short-closing-tag
	}
	output += `</block>\n`
	return output;
}





function NODE(name, attributes = {}, ...children) {
	let node = document.createElement(name);
	for (let key in attributes)
		node.setAttribute(key, attributes[key]);
	node.ADD(...children)
	return node;
}
Element.prototype.ADD = function addChildren(...children) {
	for (let child of children)
		this.appendChild(typeof child == 'string' ? document.createTextNode(child) : child);
	return this;
}
function html(node, level = 0) {
	// if(node.tagName=='xxxxx') 
	if (node.nodeType == 3) {
		if (node.nodeValue.trim()) return NODE('kv').ADD(NODE('value').ADD(node.nodeValue));
		else return '';
	}

	let children = Array.from(node.childNodes);
	let attributes = Array.from(node.attributes);

	let open = NODE('tag').ADD(NODE('c').ADD('<'), NODE('key').ADD(node.tagName))
	let output = NODE('block', { class: 'tag ' + node.tagName }).ADD(open)
	if (attributes.length)
		open.ADD(NODE('div', { class: 'attributes' }).ADD(
			...attributes.map(attr =>
				NODE('kv').ADD(
					NODE('key').ADD(' ' + attr.name),
					NODE('c').ADD('="'),
					NODE('value').ADD(attr.value),
					NODE('c').ADD('"'),
				)),

		))
	let fullClose = NODE('tag').ADD(NODE('c').ADD('</'), NODE('key').ADD(node.tagName), NODE('c').ADD('>'))
	let halfClose = NODE('tag').ADD(NODE('c').ADD('/>'))
	if (children.length)
		open.ADD(NODE('c').ADD('>'))
	if (children.length)
		output.ADD(NODE('div', { class: 'children' }).ADD(
			...children.map(child => html(child))
		),
			fullClose
		)
	else
		// output.ADD( NODE('c').ADD('/>'))
		output.ADD(halfClose)

	return output;
}





export function converter(data) {
	console.log('conv', data)
	if (typeof data == 'string') data = new DOMParser().parseFromString(`<xxxxx>${data}</xxxxx>`, 'text/xml').firstChild;
	return html(data);
	let string = html(data)
	console.log('html', string);
	return new DOMParser().parseFromString(string, 'text/html').firstChild;
}

export const style = `
tag>key{color: white}
tag:last-child{display: none}


`
