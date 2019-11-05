
document.head.insertAdjacentHTML('beforeend',`
<template id='json-view'>
    <style>
    :host {
        display: block;
    }

    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
</style>
    
    <iframe></iframe>

</template>
`); 

window.customElements.define('json-view', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open', delegatesFocus: true }).appendChild(document.querySelector('template#json-view').content.cloneNode(true));
        this.addEventListener('click',e=>{try{let n = e.composedPath()[0]; this[n.closest('[on-tap]').getAttribute('on-tap')](n.closest('[on-tap]'),e,n )}catch(x){if(this.DEBUG)console.error(e,x,e.composedPath())}} );
    }
    $(q){return this.shadowRoot.querySelector(q)}
    $$(q){return this.shadowRoot.querySelectorAll(q)}
            async connectedCallback() {
            new MutationObserver(()=>{this.$('iframe').hidden = this.hidden;}).observe(this, {attributes: true});
            // await import('./ext/json-view.js');
        }
        // set string(str){this.object = JSON.parse(str);}
        set value(data) {
            if(typeof data != 'object') try{data = JSON.parse(data); } catch(e){}
            this.show();
            console.log("JSON VIEW", data);
            // this.$('iframe').contentWindow.document.body.innerHTML = `<img class='load-indicator' src='https://samherbert.net/svg-loaders/svg-loaders/bars.svg'/>`
            this.theme = {
                dark: `
                    body{tab-size: 4; -moz-tab-size: 4; font-size: 14px; white-space: pre; color: white; font-family: monospace;}
                    key{color: cornflowerblue; font-weight: bold; }
                    index{color: cyan; font-weight: bold;}
                    .string{color: white; }
                    .date{color: violet;}
                    .boolean.false{color: tomato;}
                    .boolean.true{color: lime;}
                    .number{color: orange;}
                    control{color: gray; font-weight: bold;}                `,
                light: ``
            }
            // console.log()
            this.$('iframe').contentWindow.document.body.innerHTML = `<style>${this.theme.dark}</style>` + this.html(data);

        }
        hide() { this.hidden = true; this.$('iframe').hidden = true; }
        show() { this.hidden = false; this.$('iframe').hidden = false; }


        html(JSON, level = 0) {
            let typ = typeof (JSON);
            if (Array.isArray(JSON)) typ = 'array';
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
});