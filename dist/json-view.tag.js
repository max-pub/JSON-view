console.log('json-view', import.meta.url);
export default class XML {
    static parse(string, type = 'text/xml') { // like JSON.parse
        return new DOMParser().parseFromString(string.replace(/xmlns=".*?"/g, ''), type)
    }
    static stringify(DOM) { // like JSON.stringify
        return new XMLSerializer().serializeToString(DOM).replace(/xmlns=".*?"/g, '')
    }
     static async fetch(url) {
        return XML.parse(await fetch(url).then(x => x.text()))
    }
    static tag(tagName, attributes){
        let tag = XML.parse(`<${tagName}/>`);
        for(let key in attributes) tag.firstChild.setAttribute(key,attributes[key]);
        return tag.firstChild;
    }
    static transform(xml, xsl, stringOutput = true) {
        let processor = new XSLTProcessor();
        processor.importStylesheet(typeof xsl == 'string' ? XML.parse(xsl) : xsl);
        let output = processor.transformToDocument(typeof xml == 'string' ? XML.parse(xml) : xml);
        return stringOutput ? XML.stringify(output) : output;
    }
}
XMLDocument.prototype.stringify = XML.stringify
Element.prototype.stringify = XML.stringify
const HTML = document.createElement('template');
HTML.innerHTML = `<main></main>`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		background: #333;
		tab-size: 4;
		-moz-tab-size: 4;
		font-size: 14px;
		white-space: pre;
		color: white;
		font-family: "Lucida Console", Monaco, monospace;
		/* padding: .3rem; */
	}
	/* iframe {
		width: 100%;
		height: 100%;
		border: none;
	} */
	/* body {
		tab-size: 4;
		-moz-tab-size: 4;
		font-size: 14px;
		white-space: pre;
		color: white;
		font-family: monospace;
	} */
	key {
		color: white;
		font-weight: bold;
	}
	.long>item {
		display: block;
	}
	[level='0'] {
		margin-left: 2rem;
	}
	[level='1'] {
		margin-left: 4rem;
	}
	*::before,
	*::after {
		color: silver;
	}
	.short>item {
		margin: 0;
	}
	dict::before {
		content: '{';
	}
	dict::after {
		content: '}';
	}
	list::before {
		content: '[';
	}
	list::after {
		content: ']';
	}
	item::after {
		content: ', ';
	}
	item:last-child::after {
		content: '';
	}
	key::before {
		content: '"';
	}
	key::after {
		content: '": ';
	}
	.string::before {
		content: '"';
	}
	.string::after {
		content: '"';
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
		$onModelChange() {
			this.show()
		}
		show() {
			console.log('model change', this.textContent)
			try {
				this.$view.Q('main', 1).innerHTML = this.html(JSON.parse(this.textContent));
			} catch { }
		}
		html(data, level = 0) {
			let typ = typeof (data);
			if (Array.isArray(data))
				typ = 'array';
			if (data === null)
				typ = 'null';
			let date = new Date(data);
			if (date.getFullYear() > 1970 && date.getFullYear() < 2030 && typ == 'string' && data.length > 5)
				typ = 'date';
			let url = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.exec(data)?.[0]
			if (url && url == data)
				typ = 'url';
			let output = '';
			let tabs = Array(level + 1).fill('').join('\t');
			let len = JSON.stringify(data).length;
			switch (typ) {
				case 'object':
					for (let key in data)
						output += `<item level='${level}'><key>${key}</key>${this.html(data[key], level + 1)}</item>`;
					return `<dict class='${len < 50 ? 'short' : 'long'}'>${output}</dict>`;
				case 'array':
					for (let index in data)
						output += `<item level='${level}'>${this.html(data[index], level + 1)}</item>`;
					return `<list class='${len < 50 ? 'short' : 'long'}'>${output}</list>`;
				case 'string':
				case 'url':
				case 'date':
					return `<value class='string ${typ}'>${data}</value>`;
				case 'boolean':
					return `<value class='${typ} ${data}'>${data}</value>`;
				case 'number':
				default:
					return `<value class='${typ}'>${data}</value>`;
			}
		}
	}
window.customElements.define('json-view', json_view)