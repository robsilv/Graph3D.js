(function(){
	
	var namespace = STATS3D.namespace("STATS3D.common.data");
	
	if(namespace.AxisViewModel === undefined) {
		
		var AxisViewModel = function AxisViewModel(axisLength, defaultTextSize) {
			this._init(axisLength, defaultTextSize);
		};
		
		namespace.AxisViewModel = AxisViewModel;
		
		var p = AxisViewModel.prototype = {};
		
		AxisViewModel.create = function create(axisLength, defaultTextSize) 
		{
			var newInstance = new AxisViewModel(axisLength, defaultTextSize);
			return newInstance;
		};
		
		p._init = function _init(axisLength, defaultTextSize) 
		{
			this._axisLength = axisLength;
			this._defaultTextSize = defaultTextSize;
			
			this.lines = [];
			this.text = [];
			this.markers = [];
			this.titleText = null;
			this.animationValues = { lines: [], text: [], markers: [], titleText: {}, container: {} };
			this.container = new THREE.Object3D();
			
			this.values = null; // graph data
			
			//this._updateAxesTextCallback = updateAxesTextCallback;
			//this._updateTimeCallback = updateTimeCallback;
		};
		
		p.destroy = function destroy() 
		{
			
		};
		
		// ANIMATIONS ===========================================
		p.updateAxis = function updateAxis()
		{
			if ( this.animationValues )
			{
				var markers = this.animationValues.markers;
				if ( markers )
				{
					for ( var i = 0; i < markers.length; i ++ )
					{
						var markerObj = this.markers[i];
						
						if (!isNaN(markers[i].rX))	markerObj.rotation.x = markers[i].rX;
						if (!isNaN(markers[i].rY))	markerObj.rotation.x = markers[i].rY;
						if (!isNaN(markers[i].rZ))	markerObj.rotation.x = markers[i].rZ;
						
						// Markers on the X-Axis are lines along the Y
						if (!isNaN(markers[i].xAxisLength)) 
						{
							var line = markerObj.children[0];
							var vector3 = line.geometry.vertices[0];					
							vector3.y = markers[i].xAxisLength;
							line.geometry.verticesNeedUpdate = true;
						}
						// Markers on the Y-Axis are lines along the X
						if (!isNaN(markers[i].yAxisLength)) 
						{
							var line = markerObj.children[0];
							var vector3 = line.geometry.vertices[0];					
							vector3.x = markers[i].yAxisLength;
							line.geometry.verticesNeedUpdate = true;
						}
						/*
						// Markers on the Z-Axis are lines along the X
						if (!isNaN(markers[i].yAxisLength)) 
						{
							var line = markerObj.children[0];
							var vector3 = line.geometry.vertices[0];					
							vector3.x = markers[i].yAxisLength;
							line.geometry.verticesNeedUpdate = true;
						}
						*/
						
						var text = markerObj.children[1];
						if (!isNaN(markers[i].opacity))		text.children[0].material.opacity = markers[i].opacity;
					}
				}
				
				var container = this.animationValues.container;
				if ( container )
				{
					if (!isNaN(container.rX))		this.container.rotation.x = container.rX;
					if (!isNaN(container.rY))		this.container.rotation.x = container.rY;
					if (!isNaN(container.rZ))		this.container.rotation.x = container.rZ;
				}
			}
		}		
		
		p.updateAxisText = function updateAxisText()
		{
			if ( this.animationValues )
			{			
				// Rotating text when viewing from different angles
				var texts = this.animationValues.text;
				if ( texts )
				{
					for ( var i = 0; i < texts.length; i ++ )
					{
						var textBox = this.text[i];
						if (!isNaN(texts[i].pX))	textBox.position.x = texts[i].pX;
						if (!isNaN(texts[i].pY))	textBox.position.y = texts[i].pY;
						if (!isNaN(texts[i].pZ))	textBox.position.z = texts[i].pZ;
						if (!isNaN(texts[i].rX))	textBox.rotation.x = texts[i].rX;
						if (!isNaN(texts[i].rY))	textBox.rotation.y = texts[i].rY;
						if (!isNaN(texts[i].rZ))	textBox.rotation.z = texts[i].rZ;
						//console.log("text pX "+texts[i].pX+" pY "+texts[i].pY+" pZ "+texts[i].pZ+" rX "+texts[i].rX+" rY "+texts[i].rY+" rZ "+texts[i].rZ);
					}
				}
				
				var titleText = this.animationValues.titleText;
				if ( titleText )
				{
					var textBox = this.titleText;
					if (!isNaN(titleText.pX))	textBox.position.x = titleText.pX;
					if (!isNaN(titleText.pY))	textBox.position.y = titleText.pY;
					if (!isNaN(titleText.pZ))	textBox.position.z = titleText.pZ;
					if (!isNaN(titleText.rX))	textBox.rotation.x = titleText.rX;
					if (!isNaN(titleText.rY))	textBox.rotation.y = titleText.rY;
					if (!isNaN(titleText.rZ))	textBox.rotation.z = titleText.rZ;
					if (!isNaN(titleText.opacity))		textBox.children[0].material.opacity = titleText.opacity;
				}			
			}
		}		
		
		p._animateAxisText = function _animateAxisText(text, animObj, state, length, delay)
		{
			animObj.pX = text.position.x;
			animObj.pY = text.position.y;
			animObj.pZ = text.position.z;
			animObj.rX = text.rotation.x; 
			animObj.rY = text.rotation.y; 
			animObj.rZ = text.rotation.z;
			
			var animTargObj = { pX: state.position.x,
								pY: state.position.y, 
								pZ: state.position.z, 
								rX: state.rotation.x, 
								rY: state.rotation.y, 
								rZ: state.rotation.z }
			
			return this._createGraphTween(animObj, animTargObj, length, delay, this._updateAxesTextCallback);
		}
		p._createGraphTween = function _createGraphTween(animObj, animTargObj, length, delay, updateCallBack)
		{
			var graphTween = new TWEEN.Tween(animObj);
			graphTween.to(animTargObj, length);
			graphTween.delay(delay);
			graphTween.easing(TWEEN.Easing.Quadratic.EaseInOut);
			graphTween.onUpdate(updateCallBack);
			graphTween.start();
			
			return graphTween;
		}		
		
		
		// VALUES ===========================================
		p.getAxisMarkerPos = function getAxisMarkerPos(step)
		{
			return null;
		};
		p.getMarkerInitState = function getMarkerInitState(text)
		{
			return null;
		};
		p.getMarkerInitAnimValues = function getMarkerInitAnimValues()
		{	
			return null;
		};
		p.getTitleInitState = function getTitleInitState(text)
		{
			return null;
		};
		p.getTitleInitAnimValues = function getTitleInitAnimValues(state)
		{
			return null;
		};	
	}
})();