(function(){
	
	var namespace = STATS3D.namespace("STATS3D.utils.events");
	
	if(namespace.ListenerFunctions === undefined) {
		
		var ListenerFunctions = function ListenerFunctions() {
			//MENOTE: do nothing
		};
		
		namespace.ListenerFunctions = ListenerFunctions;
		
		ListenerFunctions.createListenerFunction = function(aListenerObject, aListenerFunction) {
			var returnFunction = function() {
				aListenerFunction.apply(aListenerObject, arguments);
			};
			return returnFunction;
		};
		
		ListenerFunctions.createListenerFunctionWithArguments = function(aListenerObject, aListenerFunction, aArguments) {
			var returnFunction = function() {
				var argumentsArray = aArguments.concat([]); //MENOTE: can't concat arguments. It adds an object instead of all arguments.
				var currentArray = arguments;
				var currentArrayLength = currentArray.length;
				for(var i = 0; i < currentArrayLength; i++) {
					argumentsArray.push(currentArray[i]);
				}
				aListenerFunction.apply(aListenerObject, argumentsArray);
			};
			return returnFunction;
		};
	}
})();