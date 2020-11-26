console.log('xml-view', import.meta.url);
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
	:host(.scroll){
		overflow: auto;
		width: 100%;
		height: 100%;
	}
	:host(:not(.copy)) aside [on-tap='copy'] {
		display: none
	}
	:host(:not(.save)) aside [on-tap='save'] {
		display: none
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
	tag {
		display: block;
		margin-left: 2rem;
	}
	tag::before {
		content: '<'attr(name) '>';
	}
	tag.attributes::before {
		content: '<'attr(name) '';
	}
	attribute:last-child::after {
		content: '"/>'
	}
	tag.children>*>attribute:last-child::after {
		content: '">'
	}
	tag.children::after {
		content: '</'attr(name) '>';
	}
	attribute {
		color: #ff7;
	}
	attribute::before {
		content: attr(name) '="';
		color: silver;
	}
	attribute::after {
		content: '"';
		color: silver;
	}
	text {
		color: lightblue;
	}
	*::before,
	*::after {
		/* color: silver; */
	}
	.boolean.false {
		color: #f77;
	}
	.boolean.true {
		color: #7f7;
	}
	.int,.real {
		color: #7ff;
	}
	.time,.date,.datetime{
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
};
	class xml_view extends WebTag {
		$onReady() {
			this.showDOM()
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
			if (typeof v == 'string') v = new DOMParser().parseFromString(`<x>${v}</x>`, 'text/xml').firstChild;
			this.XML = v;
			this.render();
		}
		get text(){
			return new XMLSerializer().serializeToString(this.XML)
		}
		async render() {
			if (this.classList.contains('types'))
				this.type = (await import('https://max.pub/lib/types.js')).default;//.then(x => {console.log(x.default);this.type = x.default})
			console.log('type checker', this.type);
			console.log('render now')
			this.$view.Q('main', 1).innerHTML = this.html(this.XML);
		}
		copy() {
			import('https://max.pub/lib/data.js').then(x => x.copy(this.text))
		}
		save() {
			import('https://max.pub/lib/data.js').then(x => x.save(this.text, 'data.xml', 'text/xml'))
		}
		html(node, level = 0) {
			if (node.nodeType == 3) {
				if (node.nodeValue.trim()) return '<text>' + node.nodeValue + '</text>';
				else return '';
			}
			let output = `<tag name='${node.tagName}' class='${node.hasAttributes() ? 'attributes' : ''} ${node.childNodes.length ? 'children' : ''}'>
				<attributes>${Array.from(node.attributes).map(x => `<attribute name='${x.name}' class='${this.type(x.value)} ${x.value}'>${x.value}</attribute>`).join('\n')}</attributes>
				<children>${Array.from(node.childNodes).map(x => this.html(x)).join('\n')}</children>
				</tag>`;
			return output;
		}
	}
window.customElements.define('xml-view', xml_view)