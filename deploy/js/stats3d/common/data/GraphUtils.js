(function(){
	
	var namespace = STATS3D.namespace("STATS3D.common.data");
	
	if(namespace.GraphUtils === undefined) {
		
		var GraphUtils = function GraphUtils() {
			this._init();
		};
		
		namespace.GraphUtils = GraphUtils;
		
		var p = GraphUtils.prototype = {};
		
		GraphUtils.create = function create() {
			var newInstance = new GraphUtils();
			return newInstance;
		};
		
		p._init = function _init() 
		{
		
		};
		
		p.destroy = function destroy() 
		{
			
		};

		
		p.mapToAxis = function mapToAxis( minVal, maxVal, numSteps )
		{
			var diff = maxVal - minVal;
			var stepSize = diff / numSteps;
			var integerStrLength = stepSize.toString().split(".")[0].length;
			var stepSciNot = stepSize;
			
			for ( var i = 0; i < integerStrLength; i ++ )
			{
				stepSciNot /= 10;
			}
			
			// round to a neat number for mapping to the axis
			if (stepSciNot < 0.1 )			stepSciNot = 0.1;
			else if (stepSciNot < 0.15 )	stepSciNot = 0.15;
			else if (stepSciNot < 0.2 )		stepSciNot = 0.2;
			else if (stepSciNot < 0.5 )		stepSciNot = 0.5;
			else							stepSciNot = 1;
			
			for ( var i = 0; i < integerStrLength; i ++ )
			{
				stepSciNot *= 10;
			}
			
			stepSize = stepSciNot;
			
			var graphMinVal = 0;
			// minVal must not be zero
			if ( stepSize * numSteps < maxVal ) {
			
			}
			
			console.log("minVal "+minVal+" maxVal "+maxVal+" numSteps "+numSteps+" stepSize "+stepSize);
			
			
			return { minVal: graphMinVal, stepSize:stepSize, numSteps:numSteps }; 
		}
	}
})();