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
		
		p.mapToAxisLinear = function mapToAxisLinear(minVal, maxVal, numSteps, forceInt)
		{
			var diff = maxVal - minVal;
			var stepSize = diff / numSteps;
			
			var numArray = stepSize.toString().split(".");
			var integerStrLength = stepSize.toString().length;
			if ( numArray ) {
				integerStrLength = numArray[0].length;
			}
			
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
		
		p.mapToAxisLogarithmic = function mapToAxisLogarithmic(minVal, maxVal, numFractionalSteps, base)
		{
			var diff = maxVal - minVal;
			
			var numLogSteps = this.getLogOfBase(diff, base);
			var baseLog = 0;
			
			// make sure that there's enough space to fit all values
			numLogSteps = Math.ceil(numLogSteps);
			
			var finalMaxVal	= Math.pow(base, numLogSteps);
			graphMinVal = 0;
			
			if ( numFractionalSteps > 0 ) {
				var multiplier = Math.pow( 10, numFractionalSteps ); // to round the number
				var graphMinVal = Math.pow(1/base, numFractionalSteps);
				graphMinVal = Math.round(graphMinVal*multiplier) / multiplier;
			} else {
				graphMinVal = Math.pow(base, Math.floor(this.getLogOfBase(minVal, base))); // min log step
				
				var newMaxVal = graphMinVal;
				var numLogSteps = 0;
				
				while ( newMaxVal < maxVal ) {
					newMaxVal *= base;
					numLogSteps ++;
				}
				
				baseLog = this.getLogOfBase(graphMinVal, base); // factors of the base greater than 1 (i.e. graphMinVal 100 & base 10 = baseLog 2)
			}
			
			var numSteps = numLogSteps+numFractionalSteps;
			
			return { minVal: graphMinVal, maxVal:finalMaxVal , numSteps: numSteps, logarithmic: true, numLogSteps: numLogSteps, numFractionalSteps: numFractionalSteps, base: base, baseLog: baseLog };
		}
		
		p.getLogOfBase = function getLogOfBase(val, base, debug)
		{
			var result = Math.log(val) / Math.log(base);
			//var r2 = Math.log(val) * Math.log(base);
			
			if (debug) {
				console.log("log of "+val+" base "+base+" = "+result);
				console.log("Starting at 1, it takes "+result+" steps to get to "+val+" when each step represents a multiplication of "+base);
			}
			
			return result;
		}
		
		p.getRatioAlongAxisLinear = function getRatioAlongAxisLinear(val, minVal, maxVal)
		{
			var diffFromZero = val - minVal;
			var valueLengthOfAxis = maxVal - minVal;
			var ratio = diffFromZero / valueLengthOfAxis;
			
			return ratio;
		}
	}
})();














