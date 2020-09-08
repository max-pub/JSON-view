console.log('json-view', import.meta.url);


//[ HTML
const HTML = document.createElement('template');
HTML.innerHTML = `<main></main>`;
// console.log("HTML", HTML);
//] HTML





//[ CSS
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		background: #333;
		tab-size: 4;
		-moz-tab-size: 4;
		font-size: 14px;
		white-space: pre;
		color: white;
		font-family: monospace;
		padding: .3rem;
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
		color: cornflowerblue;
		font-weight: bold;
	}

	index {
		color: cyan;
		font-weight: bold;
	}

	.string {
		color: white;
	}

	.date {
		color: magenta;
	}

	.null,
	.undefined {
		color: violet;
	}

	.boolean.false {
		color: tomato;
	}

	.boolean.true {
		color: lime;
	}

	.number {
		color: orange;
	}

	control {
		color: gray;
		font-weight: bold;
	}`));
//] CSS







class WebTag extends HTMLElement {

	constructor() {
		super();
		// console.log('constructor', this.innerHTML);
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.appendChild(STYLE.cloneNode(true)); //: CSS
		this.$HTM = document.createElement('htm')
		this.shadowRoot.appendChild(this.$HTM)
		this.$viewUpdateCount = 0;


	}


	async connectedCallback() {

		this.$applyHTML(); //: HTML

		this.$attachMutationObservers();
		this.$attachEventListeners();




		this.$onReady(); //: onReady
	}


	$attachMutationObservers() {
		//[XSLT
		this.modelObserver = new MutationObserver(events => {
			// console.log('model change', events, events[0].type, events[0].target, events[0].target == this)
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
				
			} else {
				this.$onModelChange(events); //: $onModelChange

			}

		}).observe(this, { attributes: true, characterData: true, attributeOldValue: true, childList: true, subtree: true });
		//] XSLT

		

	}
	// window.addEventListener('load', () => this.applyXSLT());

	//[x  on-tap  on-key  $onSlotChange
	$attachEventListeners() {
		let action = (event, key) => {
			try {
				let target = event.composedPath()[0];
				// let target = event.target;
				let action = target.closest(`[${key}]`);
				// console.log('EEE', key, event.composedPath(), target, action, 'called by', this, event)
				// console.log('PATH', event.composedPath().map(x => this.$1(x)))
				this[action.getAttribute(key)](action, event, target)
			}
			catch  { }
		}








	}
	//]  on-tap  on-key  $onSlotChange


	//[ HTML
	$applyHTML() {
		// this.shadowRoot.innerHTML = `<style>${STYLE.textContent}</style>` + new XMLSerializer().serializeToString(HTML);
		this.$view = HTML.content.cloneNode(true)
		// 	this.$clearView();
		// this.shadowRoot.appendChild(STYLE.cloneNode(true));
		// this.shadowRoot.appendChild(HTML.content.cloneNode(true));
		// this.shadowRoot.insertAdjacentElement('afterbegin',STYLE);
	}
	//] HTML



	// $clearView() {
	// 	this.$clear(this.shadowRoot);
	// }
	$clear(R) {
		// https://jsperf.com/innerhtml-vs-removechild/15  >> 3 times faster
		while (R.lastChild)
			R.removeChild(R.lastChild);
	}


	// set $style(HTML) {
	// 	this.shadowRoot.innerHTML = HTML;
	// }
	get $view() {
		return this.$HTM;
		// return this.shadowRoot.lastChild;
	}
	set $view(HTML) {
		this.$clear(this.$view);
		this.$view.appendChild(HTML);
	}

	


	// 	let treeWalker = document.createTreeWalker(temp1, NodeFilter.SHOW_ELEMENT);
	// let node = null;
	// let list = [];
	// while (node = treeWalker.nextNode()) {
	// 	list.push(currentNode)
	// }








	$q1(q) { return this.shadowRoot.querySelector(q) } //: viewQS1



	


	



	


	//--------------------------------------------
	//--------------------------------------------

	
		$onReady() {
			this.show()
		}
		$onModelChange() {
			this.show()
		}
		show() {
			console.log('model change', this.textContent)
			this.$q1('main').innerHTML = this.html(JSON.parse(this.textContent));
		}
		html(JSON, level = 0) {
			let typ = typeof (JSON);
			if (Array.isArray(JSON)) typ = 'array';
			if (JSON === null) typ = 'null';
			let date = new Date(JSON);
			if (date.getFullYear() > 1970 && date.getFullYear() < 2030 && typ == 'string' && JSON.length > 5) typ = 'date';
			let output = '';
			let tabs = Array(level + 1).fill('').join('\t');
			switch (typ) {
				case 'object':
					for (let key in JSON)
						output += `\n${tabs}\t<key>${key}</key><control>:</control> ${this.html(JSON[key], level + 1)}`;
					return `<control>{</control>${output}\n${tabs}<control>}</control>`;

				case 'array':
					for (let index in JSON)
						output += `\n${tabs}\t<index>${index}</index><control>:</control> ${this.html(JSON[index], level + 1)}`;
					return `<control>[</control>${output}\n${tabs}<control>]</control>`;

				case 'string':
				case 'date':
					return `<control>"</control><value class='${typ}'>${JSON}</value><control>"</control>`;

				case 'boolean':
					return `<value class='${typ} ${JSON}'>${JSON}</value>`;
				case 'number':
				default:
					return `<value class='${typ}'>${JSON}</value>`;
				// case 'number': return `<control>"</control><value class='date'>${date}</value><control>"</control>`;
			}

			// return output;
		}

};
// console.log(WebTag)
window.customElements.define('json-view', WebTag)


