console.log('xml-view', import.meta.url);
function NODE(name, attributes = {}, ...children ) {
	let node = document.createElement(name);
	for (let key in attributes)
		node.setAttribute(key, attributes[key]);
	node.ADD(...children)
	return node;
}
Element.prototype.ADD = function addChildren(...children){
	for (let child of children)
		this.appendChild(typeof child == 'string' ? document.createTextNode(child) : child);
	return this;	
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
HTML.innerHTML = `<aside class='h-stack'>
		<div class='h-stack'>
			<a on-tap='copyAll'>copy</a>
			<a on-tap='saveAll'>save</a>
		</div>
		<div class='h-stack'>
			<a on-tap='pure'>pure</a>
			<a on-tap='long'>long</a>
		</div>
	</aside>
	<main></main>`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		background: #333;
		/* tab-size: 4; */
		/* -moz-tab-size: 4; */
		font-size: 14px;
		text-align: left;
		color: white;
		font-family: "Lucida Console", Monaco, monospace;
		/* padding: .3rem; */
		scrollbar-color: #444 #333;
		scrollbar-width: thin;
	}
	:host(.scroll) {
		overflow: auto;
		width: 100%;
		height: 100%;
	}
	:host(:not(.copy)) aside [on-tap='copyAll'] {
		color: transparent;
		/* display: none */
	}
	:host(:not(.save)) aside [on-tap='saveAll'] {
		color: transparent;
		/* display: none */
	}
	:host::-webkit-scrollbar {
		width: .5rem;
	}
	:host::-webkit-scrollbar-track {
		box-shadow: inset 0 0 6px #333;
	}
	:host::-webkit-scrollbar-thumb {
		background-color: #444;
	}
	.h-stack {
		display: flex;
		justify-content: space-between;
	}
	aside div {
		width: 20%;
	}
	aside a {
		color: gray;
		padding-bottom: .5rem;
	}
	a:hover {
		cursor: pointer;
		color: cornflowerblue
	}
	c {
		color: gray;
		/* display: none; */
	}
	:host(.pure) c {
		display: none;
	}
	:host(.pure) close {
		display: none;
	}
	.xxxxx {
		margin-left: -1rem;
	}
	.xxxxx>open,
	.xxxxx>close {
		display: none;
	}
	/* .frame{display: none;} */
	/* tag {
		display: block;
		margin-left: 2rem;
	}
	tag::before {
		content: '<';
		color: gray;
	}
	tag::after {
		content: '>';
		color: gray;
	}
	attribute>value::before {
		content: '="';
		color: gray;
	}
	attribute>value::after {
		content: '"';
		color: gray;
	} */
	tag {
		display: block;
		margin-left: 1rem;
	}
	tag:hover>*>name {
		cursor: pointer;
		color: red;
	}
	attribute {
		/* display: block; */
		margin-left: 1rem;
	}
	:host(.long) attribute {
		display: block;
	}
	:host(.long) text {
		margin-left: 1rem;
		display: block;
	}
	attribute>key {
		color: silver
	}
	:host(.pure) attribute>key {
		margin-right: .5rem;
	}
	attribute:hover>key {
		cursor: pointer;
		color: red;
	}
	attribute>value:hover,
	text:hover {
		cursor: pointer;
		background: #444;
	}
	attribute>value {
		/* default value color */
		color: #ff7;
	}
	text {
		color: lightblue;
	}
	.boolean.false {
		color: #f77;
	}
	.boolean.true {
		color: #7f7;
	}
	.int>value,
	.real>value {
		color: #7ff;
	}
	.time>value,
	.date>value,
	.datetime>value {
		color: #f7f;
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
	$event(name, options) {
		this.dispatchEvent(new CustomEvent(name, {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: options
		}));
	}
};
	class xml_view extends WebTag {
		$onReady() {
			this.showDOM()
			if (this.classList.contains('noti')) 
				import('https://max.pub/lib/notify.js')
		}
		$onDataChange() {
			this.showDOM()
		}
		type() { return '' } // default, overwritten by external type-checker
		showDOM() {
			if (!this.innerHTML.trim()) return;
			this.value = this.innerHTML;
		}
		set value(v) {
			if (typeof v == 'string') v = new DOMParser().parseFromString(`<xxxxx>${v}</xxxxx>`, 'text/xml').firstChild;
			this.XML = v;
			this.render();
		}
		get text() {
			return new XMLSerializer().serializeToString(this.XML)
		}
		async render() {
			if (this.classList.contains('types'))
				this.type = (await import('https://max.pub/lib/types.js')).default;//.then(x => {console.log(x.default);this.type = x.default})
			console.log('type checker', this.type);
			console.log('render now')
			this.$view.Q('main', 1).innerHTML = ''
			this.$view.Q('main', 1).ADD(this.html(this.XML))
		}
		pure() { this.classList.toggle('pure') }
		long() { this.classList.toggle('long') }
		copy(text) {
			import('https://max.pub/lib/data.js').then(x => x.copy(text))
			this.$event('notification', { text: 'copied to clipboard' })
		}
		save(text) {
			import('https://max.pub/lib/data.js').then(x => x.save(text, 'data.xml', 'text/xml'))
		}
		copyAll() {
			this.copy(this.text);
		}
		saveAll() {
			this.save(this.text);
		}
		copyPart(node) {
			switch (node.tagName) {
				case 'TEXT': return this.copy(node.textContent);
				case 'VALUE': return this.copy(node.textContent);
				case 'KEY': return this.copy(node.parentNode.textContent);
				case 'TAG': return this.copy(node.textContent);
			}
		}
		html(node, level = 0) {
			if (node.nodeType == 3) {
				if (node.nodeValue.trim()) return NODE('text', { 'on-tap': 'copyPart' }).ADD(node.nodeValue);
				else return '';
			}
			let children = Array.from(node.childNodes);
			let attributes = Array.from(node.attributes);
			let open = NODE('open').ADD(NODE('c').ADD('<'), NODE('name').ADD(node.tagName))
			let output = NODE('tag', { 'on-tap': 'copyPart', class: node.tagName }).ADD(open)
			if (attributes.length)
				open.ADD(NODE('attributes').ADD(
					...attributes.map(attr =>
						NODE('attribute', { class: this.type(attr.value) }).ADD(
							NODE('key', { 'on-tap': 'copyPart' }).ADD(' ' + attr.name),
							NODE('c').ADD('="'),
							NODE('value', { 'on-tap': 'copyPart' }).ADD(attr.value),
							NODE('c').ADD('"'),
						)),
				))
			let fullClose = NODE('close').ADD(NODE('c').ADD('</'), NODE('name').ADD(node.tagName), NODE('c').ADD('>'))
			let halfClose = NODE('close').ADD(NODE('c').ADD('/>'))
			if (children.length)
				open.ADD(NODE('c').ADD('>'))
			if (children.length)
				output.ADD(NODE('children').ADD(
					...children.map(child => this.html(child))
				),
					fullClose
				)
			else
				output.ADD(this.classList.contains('html') ? fullClose : halfClose)
			return output;
		}
	}
window.customElements.define('xml-view', xml_view)