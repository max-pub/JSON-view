console.log('hi-lite', import.meta.url);
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
HTML.innerHTML = `<header class='h-stack'>
		<!-- <div class='h-stack'> -->
			<a on-tap='copyAll'>copy</a>
			<a on-tap='saveAll'>save</a>
		<!-- </div>
		<div class='h-stack'> -->
			<a on-tap='types'>types</a>
			<a on-tap='pure'>pure</a>
			<a on-tap='long'>long</a>
		<!-- </div> -->
	</header>
	<style id='style'></style>
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
	:host::-webkit-scrollbar {
		width: .5rem;
	}
	:host::-webkit-scrollbar-track {
		box-shadow: inset 0 0 6px #333;
	}
	:host::-webkit-scrollbar-thumb {
		background-color: #444;
	}
	:host(:not(.copy)) header [on-tap='copyAll'] {
		color: transparent;
		/* display: none */
	}
	:host(:not(.save)) header [on-tap='saveAll'] {
		color: transparent;
		/* display: none */
	}
	kv{margin-left:1rem;}
	.h-stack {
		display: flex;
		justify-content: space-between;
	}
	header div {
		width: 20%;
	}
	header a {
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
	block {
		display: block;
		margin-left: 1rem;
	}
	block:hover>*>name {
		cursor: pointer;
		color: red;
	}
	:host(.long) kv {
		display: block;
	}
	key {
		color: silver
	}
	:host(.pure) key {
		margin-right: .5rem;
	}
	kv:hover>key {
		cursor: pointer;
		color: red;
	}
	kv>value:hover {
		cursor: pointer;
		background: #444;
	}
	value {
		/* default value color */
		color: #ff7;
	}
	.boolean.false {
		color: #f77;
	}
	.boolean.true {
		color: #7f7;
	}
	.number,
	.int,
	.real {
		color: #7ff;
	}
	.time,
	.date,
	.datetime {
		color: #f7f;
	}
	.url,.email{
		color: #99f
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
	class hi_lite extends WebTag {
		$onReady() {
			this.setData()
			this.$view.Q('main', 1).addEventListener('click', e => this.click(e))
			if (this.classList.contains('noti'))
				import('https://max.pub/lib/notify.js')
		}
		$onDataChange() {
			this.setData()
		}
		setData() {
			if (!this.innerHTML.trim()) return;
			this.value = this.innerHTML;
		}
		set value(v) {
			this._value = v;
			this.render();
		}
		get value() {
			return this._value
		}
		async render() {
			let mod = {}
			if (this.classList.contains('json'))
				mod = await import('../json.js')
			if (this.classList.contains('xml'))
				mod = await import('../xml.js')
			console.log('mod',mod)
			if (!mod.converter) return;
			this.$view.Q('#style', 1).textContent = mod.style;
			this.$view.Q('main', 1).innerHTML = ''
			this.$view.Q('main', 1).ADD(mod.converter(this.value))
			if (this.classList.contains('types')) {
				let type = (await import('https://max.pub/lib/types.js')).default;//.then(x => {console.log(x.default);this.type = x.default})
				for (let value of this.$view.Q('value')) {
					value.classList.add(type(value.textContent))
				}
			}
		}
		pure() { this.classList.toggle('pure') }
		long() { this.classList.toggle('long') }
		copy(text) {
			import('https://max.pub/lib/data.js').then(x => x.copy(text))
			this.$event('notification', { text: 'copied to clipboard' })
			return text;
		}
		save(text) {
			import('https://max.pub/lib/data.js').then(x => x.save(text, 'data.xml', 'text/xml'))
			this.$event('notification', { text: 'download initiated' })
		}
		copyAll() {
			this.copy(this.text);
		}
		saveAll() {
			this.save(this.text);
		}
		copyPart(node) {
			console.log('part', node.tagName, node.textContent)
			switch (node.tagName) {
				case 'TEXT': return this.copy(node.textContent);
				case 'VALUE': return this.copy(node.textContent);
				case 'KEY': return this.copy(node.parentNode.textContent);
				case 'TAG': return this.copy(node.textContent);
			}
		}
		click(event) {
			console.log('click', event.target)
			console.log('copied', this.copyPart(event.target))
		}
	}
window.customElements.define('hi-lite', hi_lite)