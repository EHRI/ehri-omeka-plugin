(() => {
  // src/css/item.css
  var item_default = '.container {\n    border: 1px solid #eee;\n    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n    line-height: 1.42857;\n    font-size: 14px;\n    margin: 20px 0;\n    box-shadow: 2px 2px 6px 2px rgba(230, 230, 230, 1);\n    background-color: #fff;\n}\n\n.item {\n    padding: .7em .5em;\n}\n\n.description {\n    margin: 0;\n}\n\n.description p {\n    margin: 0 0 .5rem;\n}\n\n.heading header {\n    font-family: serif;\n    margin-top: 0;\n    margin-bottom: 0;\n    text-transform: none;\n    font-size: 1.3rem;\n    font-weight: 400;\n}\n\n.heading a {\n    text-decoration: none;\n    box-shadow: none;\n}\n\n.heading a:hover {\n    text-decoration: underline;\n}\n\n.heading.Repository a header {\n    color: inherit;\n}\n\n.heading.Repository a {\n    color: #034153;\n}\n\n.heading.HistoricalAgent a {\n    color: #517c00;\n}\n\n.heading.DocumentaryUnit a {\n    color: #6c003b;\n}\n\n.heading.VirtualUnit a {\n    color: #544F5F;\n}\n\n.heading.Country a {\n    color: #864300;\n}\n\n.details {\n    font-size: .85em;\n}\n\n.details a.alt {\n    color: #111;\n    font-weight: bolder;\n    box-shadow: none;\n}\n\n.details a.alt:hover {\n    text-decoration: underline;\n}\n\n.details ul {\n    padding-left: 0;\n    margin-left: 0;\n    list-style: none;\n    color: #999;\n    margin-bottom: 5px;\n}\n\n.details li:first-child {\n    padding-left: 0;\n}\n\n.details li {\n    padding-right: 5px;\n    display: inline-block;\n}\n\n.subitems a {\n    font-size: .85em;\n    margin-top: 5px;\n    color: #333;\n    font-weight: lighter;\n    box-shadow: none;\n    text-shadow: rgba(82, 168, 236, 0.8) 0 0 5px;\n}\n\n.subitems a:hover {\n    text-decoration: underline;\n}\n\nul.alternate-names {\n    padding: 0;\n    margin: 0 0 .4rem;\n    list-style: none;\n    line-height: inherit;\n}\n\n.alternate-names li {\n    font-weight: bold;\n    display: inline;\n}\n\nul.alternate-names li:after {\n    content: " | ";\n}\n\nul.alternate-names li:last-child:after {\n    content: "";\n}\n\nfooter {\n    margin-top: 5px;\n    border-top: 1px solid #ddd;\n    padding: 0 .25em;\n    background-color: #f5f5f5;\n    overflow: auto;\n}\n\nfooter a {\n    float: right;\n    color: #666;\n    padding: .2em;\n    font-size: .85em;\n    box-shadow: none;\n}\n\nfooter a:hover {\n    color: #333;\n}\n\n.ei-placeholder {\n    margin: 10px;\n}\n\n.loading-placeholder {\n    background-color: #efefef;\n    color: #efefef;\n    white-space:nowrap;\n    -moz-transform: rotate(.8deg) skewx(-12deg);\n    -moz-box-shadow:3px 0 2px #444;\n    border:4px solid #fff;\n    background: -moz-linear-gradient(180deg, #000, #222);\n}\n';

  // src/html/item.html
  var item_default2 = '<div class="container">\n    <div class="item">\n        <div class="heading type-highlight">\n            <header>\n                <a target="_blank" class="external type-highlight loading-placeholder">\n                    Loading...\n                </a>\n            </header>\n            <ul class="alternate-names">\n                <li class="loading-placeholder">Loading...</li>\n            </ul>\n        </div>\n        <div class="details">\n            <ul>\n                <li class="loading-placeholder">Loading...</li>\n            </ul>\n        </div>\n        <div class="description">\n            <p class="loading-placeholder">Loading...</p>\n            <p class="loading-placeholder">Loading...</p>\n            <p class="loading-placeholder">Loading...</p>\n            <p class="loading-placeholder">Loading...</p>\n        </div>\n        <div class="subitems">\n        </div>\n    </div>\n    <footer>\n        <a target="_blank" href="#" class="loading-placeholder">Loading...</a>\n    </footer>\n</div>\n';

  // src/EhriWebComponents.js
  var EI_ID_ATTR = "item-id";
  var EI_BASE_URL_ATTR = "base-url";
  var EI_BASE_URL = "https://portal.ehri-project.eu";
  var EI_PATH_MAP = {
    DocumentaryUnit: "units",
    VirtualUnit: "virtual",
    Repository: "institutions",
    HistoricalAgent: "authorities",
    Country: "countries"
  };
  function truncateText(str) {
    return str ? str.split(/\r?\n\r?\n/).splice(0, 4) : [];
  }
  function renderError(errorHtml) {
    return `
    <style>
      pre.error {
          border: 1px solid #f5c6cb;
          border-radius: .3rem;
          background-color: #f8d7da;
          color: #721c24;
          padding: .4rem .7rem;
      }
    </style>
    <pre class="error">${errorHtml}</pre>
  `;
  }
  var EI_TEMPLATE = `<style>${item_default}</style>${item_default2}`;
  var EHRIItem = class extends HTMLElement {
    constructor() {
      self = super();
      this.attachShadow({ mode: "open" });
      let template = document.createElement("template");
      template.innerHTML = EI_TEMPLATE;
      this.shadowRoot.appendChild(template.content);
    }
    static get observedAttributes() {
      return [EI_ID_ATTR, EI_BASE_URL_ATTR];
    }
    attributeChangedCallback() {
      this.render();
    }
    connectedCallback() {
      this.render();
    }
    render() {
      let itemId = this.getAttribute(EI_ID_ATTR);
      let baseUrl = this.getAttribute(EI_BASE_URL_ATTR) || EI_BASE_URL;
      if (itemId) {
        fetch(`${baseUrl}/api/v1/${itemId}`).then((r) => r.json()).then((data) => {
          let renderData = this.getData(itemId, baseUrl, data);
          let fragment = this.buildFragment(renderData);
          this.shadowRoot.textContent = "";
          this.shadowRoot.appendChild(fragment);
        }).catch((e) => {
          console.error(e);
          this.shadowRoot.innerHTML = renderError(
            `An EHRI item with id &quot;${itemId}&quot; could not be loaded.`
          );
        });
      } else {
        this.shadowRoot.innerHTML = renderError(
          `An EHRI item ID must specified with the <code>item-id</code> attribute.`
        );
      }
    }
    parseRepository(baseUrl, itemId, type, json) {
      const name = json.data.attributes.name;
      const otherNames = (json.data.attributes.otherFormsOfName || []).concat(json.data.attributes.parallelFormsOfName || []);
      const paras = truncateText(json.data.attributes.history);
      const url = `${baseUrl}/${EI_PATH_MAP[type]}/${itemId}`;
      const details = [];
      for (let attr of ["streetAddress", "city"]) {
        let value = json.data.attributes.address[attr];
        if (value) {
          details.push(value);
        }
      }
      const parents = {};
      if (json.data.attributes.address) {
        parents[json.data.attributes.address.country] = `${baseUrl}/${EI_PATH_MAP[type]}/${json.data.attributes.address.countryCode.toLowerCase()}`;
      }
      let subItems = null;
      if (json.data.meta.subitems) {
        let i = json.data.meta.subitems;
        if (i > 0) {
          subItems = `${i} archival description` + (i > 1 ? "s" : "");
        }
      }
      return { type, url, name, otherNames, parents, paras, details, subItems };
    }
    parseHistoricalAgent(baseUrl, itemId, type, json) {
      const name = json.data.attributes.name;
      const otherNames = (json.data.attributes.otherFormsOfName || []).concat(json.data.attributes.parallelFormsOfName || []);
      const paras = truncateText(json.data.attributes.history);
      const url = `${baseUrl}/${EI_PATH_MAP[type]}/${itemId}`;
      const details = [];
      const parents = {};
      const subItems = null;
      return { type, url, name, otherNames, parents, paras, details, subItems };
    }
    parseDocumentaryUnit(baseUrl, itemId, type, json) {
      const name = json.data.attributes.descriptions[0].name;
      const otherNames = json.data.attributes.descriptions[0].parallelFormsOfName || [];
      const paras = truncateText(json.data.attributes.descriptions[0].scopeAndContent);
      const url = `${baseUrl}/${EI_PATH_MAP[type]}/${itemId}`;
      const details = [];
      details.push(json.data.attributes.localId);
      for (let attr of ["language", "extentAndMedium"]) {
        if (json.data.attributes.descriptions[0][attr]) {
          details.push(json.data.attributes.descriptions[0][attr]);
        }
      }
      const parents = {};
      let included = json.included ? json.included.filter((item) => item.type === "Repository") : [];
      for (let repo of included) {
        parents[repo.attributes.name] = `${baseUrl}/${EI_PATH_MAP[repo.type]}/${repo.id}`;
      }
      let subItems = null;
      if (json.data.meta.subitems) {
        let i = json.data.meta.subitems;
        if (i > 0) {
          subItems = `${i} child item` + (i > 1 ? "s" : "");
        }
      }
      return { type, url, name, otherNames, parents, paras, details, subItems };
    }
    parseCountry(baseUrl, itemId, type, json) {
      const name = json.data.attributes.name;
      const otherNames = [];
      const paras = truncateText(json.data.attributes.history);
      const url = `${baseUrl}/${EI_PATH_MAP[type]}/${itemId}`;
      const details = [];
      const parents = {};
      let subItems = null;
      if (json.data.meta.subitems) {
        let i = json.data.meta.subitems;
        if (i > 0) {
          subItems = `${i} institution` + (i > 1 ? "s" : "");
        }
      }
      return { type, url, name, otherNames, parents, paras, details, subItems };
    }
    getData(itemId, baseUrl, data) {
      const type = data.data.type;
      if (type === "Repository") {
        return this.parseRepository(baseUrl, itemId, type, data);
      } else if (type === "HistoricalAgent") {
        return this.parseHistoricalAgent(baseUrl, itemId, type, data);
      } else if (type === "DocumentaryUnit" || type === "VirtualUnit") {
        return this.parseDocumentaryUnit(baseUrl, itemId, type, data);
      } else if (type === "Country") {
        return this.parseCountry(baseUrl, itemId, type, data);
      } else {
        throw new Exception(`Unsupported item type: ${type}`);
      }
    }
    buildFragment({ type, url, name, otherNames, parents, paras, details, subItems }) {
      let content = document.createElement("template");
      content.innerHTML = EI_TEMPLATE;
      let fragment = content.content;
      let headDiv = fragment.querySelector(".heading");
      headDiv.classList.add(type);
      let headLink = fragment.querySelector(".heading header a");
      headLink.href = url;
      headLink.classList.remove("loading-placeholder");
      headLink.textContent = name;
      let altNameList = fragment.querySelector(".alternate-names");
      if (otherNames) {
        altNameList.textContent = "";
        for (let name2 of otherNames) {
          let li = document.createElement("li");
          li.textContent = name2;
          altNameList.appendChild(li);
        }
      } else {
        altNameList.remove();
      }
      let body = fragment.querySelector(".description");
      body.textContent = "";
      for (let para of paras) {
        let p = document.createElement("p");
        p.textContent = para;
        body.appendChild(p);
      }
      let detailList = fragment.querySelector(".details ul");
      detailList.textContent = "";
      for (const [name2, url2] of Object.entries(parents)) {
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.href = url2;
        a.textContent = name2;
        a.classList.add("alt");
        a.target = "_blank";
        li.appendChild(a);
        detailList.appendChild(li);
      }
      for (let detail of details) {
        let li = document.createElement("li");
        li.textContent = detail;
        detailList.appendChild(li);
      }
      let subItemsDiv = fragment.querySelector(".subitems");
      if (subItems) {
        let a = document.createElement("a");
        a.href = `${url}/search`;
        a.target = "_blank";
        a.textContent = subItems;
        subItemsDiv.appendChild(a);
      } else {
        subItemsDiv.remove();
      }
      let footerLink = fragment.querySelector("footer a");
      footerLink.href = url;
      footerLink.classList.remove("loading-placeholder");
      footerLink.textContent = "View this item on the EHRI Portal";
      return fragment;
    }
  };

  // ehri-web-components.js
  customElements.define("ehri-item", EHRIItem);
})();
