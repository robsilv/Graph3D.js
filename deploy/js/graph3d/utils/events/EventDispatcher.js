(function(){
	
	var namespace = GRAPH3D.namespace("GRAPH3D.utils.events");
	
	if(namespace.EventDispatcher === undefined) {
		
		var EventDispatcher = function EventDispatcher() {
			this._eventListeners = null;
		};
		
		namespace.EventDispatcher = EventDispatcher;
		
		p = EventDispatcher.prototype;
		
		p.addEventListener = function addEventListener(aEventType, aFunction) {
			if(this._eventListeners === null) {
				this._eventListeners = {};
			}
			if(!this._eventListeners[aEventType]){
				this._eventListeners[aEventType] = [];
			}
			this._eventListeners[aEventType].push(aFunction);
			
			return this;
		};
		
		p.removeEventListener = function removeEventListener(aEventType, aFunction) {
			if(this._eventListeners === null) {
				this._eventListeners = {};
			}
			var currentArray = this._eventListeners[aEventType];

			if (typeof(currentArray) == "undefined")
			{
				if (window.console)
					console.warn("EventDispatcher :: removeEventListener :: Tried to remove an event handler that doesn't exist");
				return this;				
			}

			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++){
				if(currentArray[i] == aFunction){
					currentArray.splice(i, 1);
					i--;
					currentArrayLength--;
				}
			}
			return this;
		};
		
		p.dispatchEvent = function dispatchEvent(aEvent) {
			//console.log("WEBLAB.utils.events.EventDispatcher::dispatchEvent");
			if(this._eventListeners === null) {
				this._eventListeners = {};
			}
			var eventType = aEvent.type;
			
			if(aEvent.target === null) {
				aEvent.target = this;
			}
			aEvent.currentTarget = this;
			//console.log(eventType, this._eventListeners[eventType]);
			var currentEventListeners = this._eventListeners[eventType];
			if(currentEventListeners !== null && currentEventListeners !== undefined) {
				var currentArray = currentEventListeners;
				var currentArrayLength = currentArray.length;
				for(var i = 0; i < currentArrayLength; i++){
					var currentFunction = currentArray[i];
					//console.log(currentFunction);
					currentFunction.call(this, aEvent);
				}
			}
			return this;
		};
		
		p.dispatchCustomEvent = function dispatchCustomEvent(aEventType, aDetail) {
			//console.log("WEBLAB.utils.events.EventDispatcher::dispatchCustomEvent");
			//console.log(aEventType, aDetail);
			var newEvent = document.createEvent("CustomEvent");
			newEvent.initCustomEvent(aEventType, false, false, aDetail);
			return this.dispatchEvent(newEvent);
		};
		
		/*
		 *	Decorate (Static)
		 *
		 *	Decorator method that bestows distpatching behaviours upon generic objects.
		 *	A convenience method for when your object cannot extend EventDispatcher
		 */
		EventDispatcher.decorate = function( object ){
			EventDispatcher.apply( object );
			object.addEventListener = p.addEventListener;
			object.dispatchEvent = p.dispatchEvent;
			object.dispatchCustomEvent = p.dispatchCustomEvent;
			object.removeEventListener = p.removeEventListener;
			return object;
		};
	}
})();