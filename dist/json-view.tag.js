console.log('json-view', import.meta.url);
function NODE(name, attributes = {}, children = []) {
	let node = document.createElement(name);
	for (let key in attributes)
		node.setAttribute(key, attributes[key]);
	for (let child of children)
		node.appendChild(typeof child == 'string' ? document.createTextNode(child) : child);
	return node;
}
class XML {
	static parse(string, type = 'xml') {
		return new DOMParser().parseFromString(string.replace(/xmlns=".*?"/g, ''), 'text/' + type)
	}
	static stringify(DOM) {
		return new XMLSerializer().serializeToString(DOM).replace(/xmlns=".*?"/g, '')
	}
}
XMLDocument.prototype.stringify = XML.stringify
Element.prototype.stringify = XML.stringify
const HTML = document.createElement('template');
HTML.innerHTML = `<aside>
		<a on-tap='copy'>copy</a>
		<a on-tap='save'>save</a>
	</aside>
	<main></main>`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		background: #333;
		font-size: 14px;
		text-align: left;
		color: white;
		font-family: "Lucida Console", Monaco, monospace;
		/* padding: .3rem; */
	}
	:host(:not(.copy)) aside [on-tap='copy'] {
		display: none
	}
	:host(:not(.save)) aside [on-tap='save'] {
		display: none
	}
	aside {
		display: flex;
		justify-content: space-between;
	}
	aside a {
		color: silver;
		padding-bottom: .5rem;
	}
	a:hover {
		cursor: pointer;
		color: cornflowerblue
	}
	:host(.break-all) .short>item {
		display: block;
	}
	:host(:not(.break-all)) .short>item {
		margin: 0;
	}
	.long>item {
		display: block;
	}
	*::before,
	*::after {
		color: silver;
	}
	.object::before {
		content: '{';
	}
	.object::after {
		content: '}';
	}
	.array::before {
		content: '[';
	}
	.array>item>key {
		display: none;
	}
	.array::after {
		content: ']';
	}
	item {
		margin-left: 2rem;
	}
	item::after {
		/* content: ', '; */
	}
	item:last-child::after {
		content: '';
	}
	key {
		color: white;
		/* font-weight: bold; */
	}
	key::before {
		/* content: '"'; */
	}
	key::after {
		/* content: '": '; */
		content: ": "
	}
	.string::before {
		/* content: '"'; */
	}
	.string::after {
		/* content: '"'; */
	}
	.string {
		color: gold;
	}
	.date {
		color: magenta;
	}
	.url {
		color: pink;
	}
	.null,
	.undefined {
		color: silver;
	}
	.boolean.false {
		color: #f44;
	}
	.boolean.true {
		color: #4f4;
	}
	.number {
		color: aqua;
	}`));
function QQ(query, i) {
	let result = Array.from(this.querySelectorAll(query));
	return i ? result?.[i - 1] : result;
}
Element.prototype.Q = QQ
ShadowRoot.prototype.Q = QQ
DocumentFragment.prototype.Q = QQ
class WebTag extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.appendChild(STYLE.cloneNode(true)); //: CSS
		this.$HTM = document.createElement('htm')
		this.shadowRoot.appendChild(this.$HTM)
	}
	async connectedCallback() {
		this.$applyHTML(); //: HTML
		this.$attachMutationObservers();
		this.$attachEventListeners();
		this.$onReady(); //: onReady
	}
	$attachMutationObservers() {
		this.modelObserver = new MutationObserver(events => {
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
			} else {
				this.$onDataChange(events); //: $onDataChange
			}
		}).observe(this, { attributes: true, characterData: true, attributeOldValue: true, childList: true, subtree: true });
	}
	$attachEventListeners() {
		let action = (event, key) => {
			try {
				let target = event.composedPath()[0];
				let action = target.closest(`[${key}]`);
				this[action.getAttribute(key)](action, event, target)
			}
			catch { }
		}
		this.addEventListener('click', e => action(e, 'on-tap')); //: onTap
	}
	$applyHTML() {
		this.$view = HTML.content.cloneNode(true)
	}
	$clear(R) {
		while (R.lastChild)
			R.removeChild(R.lastChild);
	}
	get $view() {
		return this.$HTM;
	}
	set $view(HTML) {
		this.$clear(this.$view);
		if (typeof HTML == 'string')
			HTML = new DOMParser().parseFromString(HTML, 'text/html').firstChild
		this.$view.appendChild(HTML);
	}
};
	class json_view extends WebTag {
		$onReady() {
			this.show()
		}
		$onDataChange() {
			this.show()
		}
		show() {
			try {
				this.$view.Q('main', 1).innerHTML = this.html(JSON.parse(this.textContent));
			} catch { }
		}
		copy() {
			import('https://max.pub/lib/data.js').then(x => x.copy(this.textContent))
		}
		save() {
			import('https://max.pub/lib/data.js').then(x => x.save(this.textContent, 'data.json', 'application/json'))
		}
		html(data, level = 0) {
			let typ = typeof (data);
			if (Array.isArray(data)) typ = 'array';
			if (data === null) typ = 'null';
			let output = '';
			let len = JSON.stringify(data).length;
			switch (typ) {
				case 'object':
				case 'array':
					for (let key in data)
						output += `<item level='${level}'><key>${key}</key>${this.html(data[key], level + 1)}</item>`;
					return `<list class='${typ} ${len < 50 ? 'short' : 'long'}'>${output}</list>`;
				default:
					return `<value class='${typ} ${data}'>${data}</value>`;
			}
		}
	}
window.customElements.define('json-view', json_view)