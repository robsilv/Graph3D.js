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
		
		// INTIAL RENDER ===============================
		p.renderAxis = function renderAxis(delay, title, graphObj)
		{
			var axisNum = this.values.minVal;
			var numSteps = this.values.numSteps;
			
			graphObj.add( this.container );	
			
			for ( var i = 0; i <= numSteps; i ++ )
			{
				var geometry = new THREE.Geometry();
				geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
				geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
			
				var markerObj = new THREE.Object3D();
				this.container.add( markerObj );
				this.markers.push( markerObj );
				
				markerObj.position = this._getAxisMarkerPos(i * (this._axisLength/numSteps));
				
				var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 1 } ) );
				
				markerObj.add( line );
				this.lines.push(line);

				var text = this._createText(axisNum.toString());
				text.children[0].material.opacity = 0;
				
				var state = this._getMarkerInitState(text);
				
				text.position = state.position;
				text.rotation = state.rotation;
				
				markerObj.add( text );
				this.text.push(text);
				
				// Set animation values to tween in marker objects (containing text and marker line for point on axis)
				//var animVal = this.animationValues.markers[i];

				// Begin tween for marker objects
				var animInitObj = this._getMarkerInitAnimValues();
				this.animationValues.markers[i] = animInitObj.animObj;
				
				this._createGraphTween(animInitObj.animObj, animInitObj.targObj, animInitObj.animLength, delay, this._updateTimeCallback);
				
				delay += 50;
				
				axisNum += this.values.stepSize;
			}
			
			var text = this._createText(title, 20);
			
			state = this._getTitleInitState(text);
			
			this.markerTitleDefault = state;
			
			text.position = this.markerTitleDefault.position;
			text.rotation = this.markerTitleDefault.rotation;
			
			this.container.add( text );
			this.titleText = text;
			
			text.children[0].material.opacity = 0;
			
			var animInitObj = this._getTitleInitAnimValues(state);
			this.animationValues.titleText = animInitObj.animObj;
			
			this._createGraphTween(animInitObj.animObj, animInitObj.targObj, animInitObj.animLength, delay, this._updateAxesTextCallback);
		}
		
		// CREATE TEXT =================================
		p._createText = function _createText(str, size)
		{
			// Get text from hash
			var hash = document.location.hash.substr( 1 );

			if ( hash.length !== 0 ) {

				str = hash;

			}
			
			if (!size)	size = this._defaultTextSize;

			var geometry = new THREE.TextGeometry( str, {

				size: size,
				height: 1,
				curveSegments: 2,
				font: "helvetiker"

			});

			geometry.computeBoundingBox();
			var centerOffset = -0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
			var rightOffset = -1 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
			
			var textMaterial = new THREE.MeshBasicMaterial( { color:  0x000000, overdraw: true } );
			var text = new THREE.Mesh( geometry, textMaterial );

			text.doubleSided = false;

			var parent = new THREE.Object3D();
			parent.add( text );
			
			return parent;
		}		
		
		// ANIMATIONS ===========================================
		
		p.axisToDefaultView = function axisToDefaultView()
		{
			this._gotoAxisView("Init");
		}
		
		p._gotoAxisView = function _gotoAxisView(name)
		{
			if (!this.values) return;
			
			var delay = 0;
			
			var numSteps = this.values.numSteps;
			//this.container.rotation.x = 0;
			
			var animInitObj = this["_get"+name+"AxisAnimValues"]();
			this.animationValues.container = animInitObj.animObj;
			this._createGraphTween(animInitObj.animObj, animInitObj.targObj, animInitObj.animLength, delay, this._updateTimeCallback);

			delay += 1200;
			
			for ( var i = 0; i < this.markers.length; i ++ )
			{
				var text = this.markers[i].children[1];

				var state = this["_getMarker"+name+"State"](text);

				//text.position = state.position;
				//text.rotation = state.rotation;
				
				var animLength = 150;
				var animObj = this.animationValues.text[i] = {};
				
				this._animateAxisText( text, animObj, state, animLength, delay );
				
				delay += 25;
			}
			
			text = this.titleText;
			
			delay = 800;

			state = this["_getTitle"+name+"State"](text);
			
			//text.position = state.position;
			//text.rotation = state.rotation;
			
			var animLength = 500;
			if (!this.animationValues.titleText) {
				this.animationValues.titleText = {};
			}
			var animObj = this.animationValues.titleText;
			
			this._animateAxisText( text, animObj, state, animLength, delay );
		}
		
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
					if (!isNaN(container.rY))		this.container.rotation.y = container.rY;
					if (!isNaN(container.rZ))		this.container.rotation.z = container.rZ;
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
		p._getAxisMarkerPos = function _getAxisMarkerPos(step)
		{
			return null;
		};
		p._getMarkerInitState = function _getMarkerInitState(text)
		{
			return null;
		};
		p._getMarkerInitAnimValues = function _getMarkerInitAnimValues()
		{	
			return null;
		};
		p._getTitleInitState = function _getTitleInitState(text)
		{
			return null;
		};
		p._getTitleInitAnimValues = function _getTitleInitAnimValues(state)
		{
			return null;
		};
		p._getInitAxisAnimValues = function _getInitAxisAnimValues()
		{
			var obj = { animLength: 1000,
						animObj: { rX: this.container.rotation.x, rY: this.container.rotation.y, rZ: this.container.rotation.z },
						targObj: { rX: 0, rY: 0, rZ: 0 } };
			
			return obj;
		};
	}
})();