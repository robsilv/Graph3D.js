(function(){
	
	var namespace = GRAPH3D.namespace("GRAPH3D.common.data");
	
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

		
		p.mapToAxis = function mapToAxis( minVal, maxVal, numSteps, forceInt )
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
			//else if (stepSciNot < 0.125 )	stepSciNot = 0.125;
			else if (stepSciNot < 0.15 )	stepSciNot = 0.15;
			else if (stepSciNot < 0.2 )		stepSciNot = 0.2;
			else if (stepSciNot < 0.5 )		stepSciNot = 0.5;
			else							stepSciNot = 1;
			
			for ( var i = 0; i < integerStrLength; i ++ )
			{
				stepSciNot *= 10;
			}
			
			stepSize = stepSciNot;
			
			if (forceInt)	stepSize = Math.ceil(stepSize);
			
			var graphMinVal = 0;
			// minVal must not be zero
			//TODO: Need to dynamically find the start position, i.e. the step below the min val.
			if ( stepSize * numSteps < maxVal ) 
			{
				graphMinVal = Math.floor(minVal);
				//console.log("MIN VAL NOT ZERO "+minVal);
			}
			
			var finalMaxVal	= minVal + (stepSize * numSteps);
			var maxNumSteps = numSteps;
			for ( var i = 0; i < numSteps; i ++ )
			{
				var stepVal = graphMinVal + (stepSize * i);
				
				if (stepVal >= maxVal ) {
					maxNumSteps = i;
					finalMaxVal = stepVal;
					console.log("maxStep "+stepVal+" finalMaxVal "+finalMaxVal+" i "+i);
					break;
				}
			}
			
			console.log("minVal "+minVal+" maxVal "+maxVal+" numSteps "+maxNumSteps+" stepSize "+stepSize);
			
			
			return { minVal: graphMinVal, maxVal:finalMaxVal , stepSize:stepSize, numSteps:maxNumSteps }; 
		}
	}
})();