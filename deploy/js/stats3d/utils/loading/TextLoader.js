(function(){
	
	var namespace = STATS3D.namespace("STATS3D.utils.loading");
	
	var EventDispatcher = STATS3D.namespace("STATS3D.utils.events").EventDispatcher;
	var ListenerFunctions = STATS3D.namespace("STATS3D.utils.events").ListenerFunctions;
	
	if(namespace.TextLoader === undefined) {
		
		var TextLoader = function TextLoader() {
			this._init();
		};
		
		namespace.TextLoader = TextLoader;
		
		TextLoader.LOADED = "loaded";
		TextLoader.ERROR = "error";
		
		var p = TextLoader.prototype = new EventDispatcher();
		
		p._init = function _init() {
			
			this._url = null;
			this._loader = null;
			this._data = null;
			
			return this;
		};
		
		TextLoader.create = function create(aUrl) {
			var newTextLoader = new TextLoader();
			newTextLoader.setUrl(aUrl);
			return newTextLoader;
		};
		
		p.getData = function getData() {
			return this._data;
		}
		
		p.setUrl = function setUrl(aUrl) {
			
			this._url = aUrl;
			
			return this;
		};
		
		p.load = function load() {
			
			this._loader = new XMLHttpRequest();
			this._loader.open("GET", this._url, false);
			
			this._loader.onreadystatechange = ListenerFunctions.createListenerFunction(this, this._onReadyStateChange);
			
			this._loader.send(null);
			
			return this;
		};
		
		p._onReadyStateChange = function _onReadyStateChange() {
			console.log("STATS3D.utils.loading.TextLoader::_onReadyStateChange");
			console.log(this._url, this._loader.readyState, this._loader.status);
			switch(this._loader.readyState) {
				case 0: //Uninitialized
				case 1: //Set up
				case 2: //Sent
				case 3: //Partly done
					//MENOTE: do nothing
					break;
				case 4: //Done
					if(this._loader.status < 400) {
						this._data = this._loader.responseText;
						this.dispatchCustomEvent(TextLoader.LOADED, this.getData());
					}
					else {
						this.dispatchCustomEvent(TextLoader.ERROR, null);
					}
					break;
			}
		};
		
		p.destroy = function destroy() {
			
		}
	}
})();