(function(){

var namespace = GRAPH3D.namespace("GRAPH3D.common.ui.views");
var GraphUtils = GRAPH3D.namespace("GRAPH3D.common.data").GraphUtils;
var XAxisViewModel = GRAPH3D.namespace("GRAPH3D.common.data").XAxisViewModel;
var YAxisViewModel = GRAPH3D.namespace("GRAPH3D.common.data").YAxisViewModel;
var ZAxisViewModel = GRAPH3D.namespace("GRAPH3D.common.data").ZAxisViewModel;
var ListenerFunctions = GRAPH3D.namespace("GRAPH3D.utils.events").ListenerFunctions;

//var EventDispatcher = GRAPH3D.namespace("GRAPH3D.utils.events").EventDispatcher;

if(namespace.GraphView === undefined) 
{	
	var GraphView = function GraphView() {
		this._init();
		this._animate();
	};
	
	// constants
	GraphView.BOTTOM = "bottom";
	GraphView.RIGHT = "right";
	GraphView.FRONT = "front";
	GraphView.OVER = "over";
	
	namespace.GraphView = GraphView;
		
	var p = GraphView.prototype = {};//new EventDispatcher();
	
	GraphView.create = function create() 
	{
		var newGraphView = new GraphView();
		return newGraphView;
	};	
	
	p._init = function _init()
	{
		this._defaultTextSize = 16;
		this._axisLength = 1000;
		
		this.dataProvider = null;
		this._graphUtils = GraphUtils.create();
		
		this._updateTimeCallback = ListenerFunctions.createListenerFunction(this, this._updateTime);
		this._updateAxesTextCallback = ListenerFunctions.createListenerFunction(this, this._updateAxesText);
		this._completeTimeCallback = ListenerFunctions.createListenerFunction(this, this._completeTime);		
		
		this._xAxisViewModel = XAxisViewModel.create(this._axisLength, this._defaultTextSize);
		this._xAxisViewModel._updateAxesTextCallback = this._updateAxesTextCallback;
		this._xAxisViewModel._updateTimeCallback = this._updateTimeCallback;
			
		this._yAxisViewModel = YAxisViewModel.create(this._axisLength, this._defaultTextSize);
		this._yAxisViewModel._updateAxesTextCallback = this._updateAxesTextCallback;
		this._yAxisViewModel._updateTimeCallback = this._updateTimeCallback;
		
		this._zAxisViewModel = ZAxisViewModel.create(this._axisLength, this._defaultTextSize);
		this._zAxisViewModel._updateAxesTextCallback = this._updateAxesTextCallback;
		this._zAxisViewModel._updateTimeCallback = this._updateTimeCallback;
		
		this._offsetTop = 0;//window.innerHeight/4*3;
		this._offsetLeft = 0;//window.innerWidth;
		this._animLength = 1800;
		
		this._container = document.createElement( 'div' );
		document.body.appendChild( this._container );
		
		var info = document.createElement( 'div' );
		info.style.position = 'absolute';
		info.style.top = '40px';
		info.style.width = '100%';
		info.style.textAlign = 'center';
		info.innerHTML = 'Drag to spin the graph';
		this._container.appendChild( info );
		
		
		//this._cameraLookAt = new THREE.Vector3(500, 300, -500);
		//this._cameraLookAt = new THREE.Vector3(0, 0, 0);
		//this._fixedCameraPos = new THREE.Vector3(0, 0, 0);
		//this._dynamicCameraPos = new THREE.Vector3(200, 100, 200);
		
		var distance = 2500;
		this._camera = new THREE.CombinedCamera( window.innerWidth /2, window.innerHeight/2, 70, 1, distance, -distance, distance, distance );

		this._scene = new THREE.Scene();

		this._scene.add( this._camera );
		
		this._graphObjContainer = new THREE.Object3D();
		this._scene.add(this._graphObjContainer);
		this._graphObj = new THREE.Object3D();
		this._graphObjContainer.add(this._graphObj);
		this._graphObj.position.x = -this._axisLength /2;
		this._graphObj.position.y = -this._axisLength /2;
		this._graphObj.position.z = this._axisLength /2;
		

		// Lights

		var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
		this._scene.add( ambientLight );

		var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
		directionalLight.position.x = Math.random() - 0.5;
		directionalLight.position.y = Math.random() - 0.5;
		directionalLight.position.z = Math.random() - 0.5;
		directionalLight.position.normalize();
		this._scene.add( directionalLight );

		var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
		directionalLight.position.x = Math.random() - 0.5;
		directionalLight.position.y = Math.random() - 0.5;
		directionalLight.position.z = Math.random() - 0.5;
		directionalLight.position.normalize();
		this._scene.add( directionalLight );		

		//this._renderer = new THREE.CanvasRenderer();
		this._renderer = new THREE.WebGLRenderer({ antialias: true } );
		this._renderer.setSize( window.innerWidth, window.innerHeight );
		
		this._container.appendChild( this._renderer.domElement );

		this._stats = new Stats();
		this._stats.domElement.style.position = 'absolute';
		this._stats.domElement.style.top = '0px';
		this._container.appendChild( this._stats.domElement );

		
		var scope = this;
		window.addEventListener( 'resize', function() { scope._onWindowResize() }, false );
	}
	
	p._onWindowResize = function _onWindowResize() 
	{
		this._camera.setSize( window.innerWidth, window.innerHeight );
		this._camera.updateProjectionMatrix();

		this._renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	p.destroy = function destroy() 
	{
	
	};
	
	p.enable = function enable()
	{
		this.setOrthographic();
		this.setLens(12);
		this._camera.setZoom(2.5);
		
		this._bottomViewButton = document.getElementById("bottomView");
		this._rightViewButton = document.getElementById("rightView");
		this._frontViewButton = document.getElementById("frontView");
		this._overViewButton = document.getElementById("overView");
		
		var scope = this;
		
		this._bottomViewButton.addEventListener( "click", function() { scope.toBottomView(); } );
		this._rightViewButton.addEventListener( "click", function() { scope.toRightView(); } );
		this._frontViewButton.addEventListener( "click", function() { scope.toFrontView(); } );
		this._overViewButton.addEventListener( "click", function() { scope.toOverView(); } );
		
		this._targetRotationY = 0;
		this._targetRotationYOnMouseDown = 0;

		this._mouseX = 0;
		this._mouseXOnMouseDown = 0;
		
		this._targetRotationX = 0;
		this._targetRotationXOnMouseDown = 0;

		this._mouseY = 0;
		this._mouseYOnMouseDown = 0;
		
		/*
		//this._cameraValues = {"lineEnvelope": 0, "contentEnvelope": 0};
		this._cameraValues = {camRX: this._camera.rotation.x, 
							  camRY: this._camera.rotation.y, 
							  camRZ: this._camera.rotation.z, 
							  camPX: this._camera.position.x, 
							  camPY:this._camera.position.y, 
							  camPZ:this._camera.position.z};
		*/
		
		this._graphValues = {rX: 0, rY: 0, rZ: 0};
		
		document.addEventListener( 'mousedown', function(event) { scope._onDocumentMouseDown(event); }, false );
		document.addEventListener( 'touchstart', function(event) { scope._onDocumentTouchStart(event); }, false );
		document.addEventListener( 'touchmove', function(event) { scope._onDocumentTouchMove(event); }, false );
		
		this._renderAxes();
		
		//this.toOverView();
		// GO TO OVERVIEW WITHOUT TRIGGERING AXIS ANIMS
		this._currentView = GraphView.OVER;
	
		this._freeRotate = false;
		
		this._graphValues = {rX: this._graphObjContainer.rotation.x, rY: this._graphObjContainer.rotation.y, rZ: this._graphObjContainer.rotation.z};
		
		var tween = this._createGraphTween(this._graphValues, {rX: Math.PI/12, rY:-Math.PI/4, rZ: 0}, this._animLength, 0, this._updateTimeCallback);
		tween.onComplete(this._completeTimeCallback);

		var t = setTimeout( function() { scope._renderGridXZ() }, 5000);
		var t = setTimeout( function() { scope._renderGridYZ() }, 5500);
		var t = setTimeout( function() { scope._renderGridXY() }, 6000);
		var t = setTimeout( function() { scope._plotData() }, 7500);
	};

	p.disable = function disable()
	{

	};
	
	p._onDocumentMouseDown = function _onDocumentMouseDown( event )
	{
		event.preventDefault();
		
		var scope = this;
		
		this._mouseMoveListener = function(event) { scope._onDocumentMouseMove(event) };
		this._mouseUpListener = function(event) { scope._onDocumentMouseUp(event) };
		this._mouseOutListener = function(event) { scope._onDocumentMouseOut(event) };

		document.addEventListener( 'mousemove', this._mouseMoveListener, false );
		document.addEventListener( 'mouseup', this._mouseUpListener, false );
		document.addEventListener( 'mouseout', this._mouseDownListener, false );

		this._mouseXOnMouseDown = event.clientX - window.innerWidth / 2;
		this._targetRotationYOnMouseDown = this._targetRotationY;
		
		this._mouseYOnMouseDown = event.clientY - window.innerHeight / 2;
		this._targetRotationXOnMouseDown = this._targetRotationX;
	}

	p._onDocumentMouseMove = function _onDocumentMouseMove( event )
	{
		this._mouseX = event.clientX - window.innerWidth / 2;
		this._mouseY = event.clientY - window.innerHeight / 2;
		
		this._targetRotationX = this._targetRotationXOnMouseDown + ( this._mouseY - this._mouseYOnMouseDown ) * 0.005;
		this._targetRotationY = this._targetRotationYOnMouseDown + ( this._mouseX - this._mouseXOnMouseDown ) * 0.005;
	}

	p._onDocumentMouseUp = function _onDocumentMouseUp( event ) {

		document.removeEventListener( 'mousemove', this._mouseMoveListener, false );
		document.removeEventListener( 'mouseup', this._mouseUpListener, false );
		document.removeEventListener( 'mouseout', this._mouseOutListener, false );
	}

	p._onDocumentMouseOut = function _onDocumentMouseOut( event ) 
	{
		document.removeEventListener( 'mousemove', this._mouseMoveListener, false );
		document.removeEventListener( 'mouseup', this._mouseUpListener, false );
		document.removeEventListener( 'mouseout', this._mouseOutListener, false );
	}

	p._onDocumentTouchStart = function _onDocumentTouchStart( event ) 
	{
		if ( event.touches.length == 1 )
		{
			event.preventDefault();

			this._mouseXOnMouseDown = event.touches[ 0 ].pageX - window.innerWidth / 2;
			this._targetRotationYOnMouseDown = this._targetRotationY;
			
			this._mouseYOnMouseDown = event.touches[ 0 ].pageY - window.innerHeight / 2;
			this._targetRotationXOnMouseDown = this._targetRotationX;
		}
	}

	p._onDocumentTouchMove = function _onDocumentTouchMove( event ) 
	{
		if ( event.touches.length == 1 )
		{
			event.preventDefault();

			this._mouseX = event.touches[ 0 ].pageX - window.innerWidth / 2;
			this._targetRotationY = this._targetRotationYOnMouseDown + ( this._mouseX - this._mouseXOnMouseDown ) * 0.05;
			
			this._mouseY = event.touches[ 0 ].pageY - window.innerHeight / 2;
			this._targetRotationX = this._targetRotationXOnMouseDown + ( this._mouseY - this._mouseYOnMouseDown ) * 0.05;
		}
	};		
	
	p.toBottomView = function toBottomView()
	{
		var oldView = this._currentView;
		this._currentView = GraphView.BOTTOM;
		
		this._freeRotate = false;
		
		this._graphValues = {rX: this._graphObjContainer.rotation.x, rY: this._graphObjContainer.rotation.y, rZ: this._graphObjContainer.rotation.z};
		
		var tween = this._createGraphTween(this._graphValues, {rX: 0, rY: -Math.PI / 2, rZ: Math.PI / 2}, this._animLength, 0, this._updateTimeCallback);
		tween.onComplete(this._completeTimeCallback);

		this._xAxisViewModel.axisToBottomView();
		this._yAxisViewModel.axisToBottomView();
		this._zAxisViewModel.axisToBottomView();
		
		//if (this._xAxisViewModel) 	this._graphObj.add(this._xAxisViewModel.container);
		//if (this._yAxisViewModel) 	this._graphObj.remove(this._yAxisViewModel);
		//if (this._zAxisViewModel) 	this._graphObj.add(this._zAxisViewModel);
	}
	
	p.toRightView = function toRightView()
	{
		this._currentView = GraphView.RIGHT;
		
		this._freeRotate = false;
		
		this._graphValues = {rX: this._graphObjContainer.rotation.x, rY: this._graphObjContainer.rotation.y, rZ: this._graphObjContainer.rotation.z};
		
		var tween = this._createGraphTween(this._graphValues, {rX: 0, rY:-Math.PI / 2, rZ: 0}, this._animLength, 0, this._updateTimeCallback);
		tween.onComplete(this._completeTimeCallback);

		this._xAxisViewModel.axisToDefaultView();
		this._yAxisViewModel.axisToRightView();
		this._zAxisViewModel.axisToRightView();
		
		//if (this._xAxisViewModel) 	this._graphObj.remove(this._xAxisViewModel.container);
		//if (this._yAxisViewModel) 	this._graphObj.add(this._yAxisViewModel);
		//if (this._zAxisViewModel) 	this._graphObj.add(this._zAxisViewModel);
	}
	
	p.toFrontView = function toFrontView()
	{
		var oldView = this._currentView;
		this._currentView = GraphView.FRONT;
		
		this._freeRotate = false;
		
		this._graphValues = {rX: this._graphObjContainer.rotation.x, rY: this._graphObjContainer.rotation.y, rZ: this._graphObjContainer.rotation.z};
		
		var tween = this._createGraphTween(this._graphValues, {rX: 0, rY:0, rZ: 0}, this._animLength, 0, this._updateTimeCallback);
		tween.onComplete(this._completeTimeCallback);
		
		this._xAxisViewModel.axisToDefaultView();
		this._yAxisViewModel.axisToDefaultView();
		this._zAxisViewModel.axisToRightView();
		//this._zAxisViewModel.axisToDefaultView();
		
		//if (this._xAxisViewModel) 	this._graphObj.add(this._xAxisViewModel.container);
		//if (this._yAxisViewModel) 	this._graphObj.add(this._yAxisViewModel);
		//if (this._zAxisViewModel) 	this._graphObj.remove(this._zAxisViewModel);
	}
	
	p.toOverView = function toOverView()
	{
		this._currentView = GraphView.OVER;
	
		this._freeRotate = false;
		
		this._graphValues = {rX: this._graphObjContainer.rotation.x, rY: this._graphObjContainer.rotation.y, rZ: this._graphObjContainer.rotation.z};
		
		var tween = this._createGraphTween(this._graphValues, {rX: Math.PI/12, rY:-Math.PI/4, rZ: 0}, this._animLength, 0, this._updateTimeCallback);
		tween.onComplete(this._completeTimeCallback);
		
		this._xAxisViewModel.axisToDefaultView();
		this._yAxisViewModel.axisToDefaultView();
		//this._zAxisViewModel.axisToRightView();
		this._zAxisViewModel.axisToDefaultView();
		
		//if (this._xAxisViewModel) 	this._graphObj.add(this._xAxisViewModel.container);
		//if (this._yAxisViewModel) 	this._graphObj.add(this._yAxisViewModel);
		//if (this._zAxisViewModel) 	this._graphObj.add(this._zAxisViewModel);
	}
	
	p._updateTime = function _updateTime() 
	{
		/*
		this._camera.rotation.x = this._cameraValues.camRX;
		this._camera.rotation.y = this._cameraValues.camRY;
		this._camera.rotation.z = this._cameraValues.camRZ;
		
		this._camera.position.x = this._cameraValues.camPX;
		this._camera.position.y = this._cameraValues.camPY;
		this._camera.position.z = this._cameraValues.camPZ;
		*/
		this._graphObjContainer.rotation.x = this._graphValues.rX;
		this._graphObjContainer.rotation.y = this._graphValues.rY;
		this._graphObjContainer.rotation.z = this._graphValues.rZ;
		
		this._targetRotationY = this._graphObjContainer.rotation.y;

		// Animate X, Y, Z Axes
		if ( this._axesObjects.animationValues )
		{
			var axes = ["x", "y", "z"];
			var lines = this._axesObjects.animationValues.lines;
			if ( lines )
			{
				for ( var i = 0; i < lines.length; i ++ )
				{
					var axis = axes[i];
					var len = lines[i].axisLength;
					var line = this._axesObjects.lines[i];
					var vector3 = line.geometry.vertices[1];
					vector3[axis] = len;
					line.geometry.verticesNeedUpdate = true;
				}
			}
			
			this._updateGridLines(this._axesObjects.gridXY, this._axesObjects.animationValues.gridXY);
			this._updateGridLines(this._axesObjects.gridYZ, this._axesObjects.animationValues.gridYZ);
			this._updateGridLines(this._axesObjects.gridXZ, this._axesObjects.animationValues.gridXZ);
		}
		
		this._xAxisViewModel.updateAxis();
		this._yAxisViewModel.updateAxis();
		this._zAxisViewModel.updateAxis();
	};
	
	p._updateGridLines = function _updateGridLines(gridObj, gridAnimObj)
	{
		if ( gridAnimObj )
		{
			var aLines = gridAnimObj.aLines;
			
			for ( var i = 0; i < aLines.length; i ++ )
			{
				if (!aLines[i]) continue;	// debugging
				
				var len = aLines[i].axisLength;
				
				var line = gridObj.aLines[i];
				var vector3 = line.geometry.vertices[1];
				vector3[gridAnimObj.aAxis] = len;
				line.geometry.verticesNeedUpdate = true;
			}
			
			var bLines = gridAnimObj.bLines;
			
			for ( var i = 0; i < bLines.length; i ++ )
			{
				if (!bLines[i]) continue;	// debugging
				
				var len = bLines[i].axisLength;
				
				var line = gridObj.bLines[i];
				var vector3 = line.geometry.vertices[1];
				vector3[gridAnimObj.bAxis] = len;
				line.geometry.verticesNeedUpdate = true;
			}				
		}	
	}
	
	p._updateAxesText = function _updateAxesText()
	{
		this._xAxisViewModel.updateAxisText();
		this._yAxisViewModel.updateAxisText();
		this._zAxisViewModel.updateAxisText();
	}
	
	p._completeTime = function _completeTime()
	{
		this._freeRotate = true;
	}
	
	p.setFov = function setFov( fov )
	{
		this._camera.setFov( fov );
	}

	p.setLens = function setLens( lens ) 
	{
		// try adding a tween effect while changing focal length, and it'd be even cooler!
		var fov = this._camera.setLens( lens );
	}

	p.setOrthographic = function setOrthographic() 
	{
		this._camera.toOrthographic();
	}

	p.setPerspective = function setPerspective() 
	{
		this._camera.toPerspective();
	}	
	
	p._animate = function _animate()
	{
		var scope = this;
		requestAnimationFrame( function() { scope._animate() } );

		this._render();
		this._stats.update();
	}

	p._render = function _render() 
	{
		if ( this._freeRotate )
		{
			//this._graphObjContainer.rotation.x += ( this._targetRotationX - this._graphObjContainer.rotation.x ) * 0.05;
			this._graphObjContainer.rotation.y += ( this._targetRotationY - this._graphObjContainer.rotation.y ) * 0.05;

			//this._camera.lookAt( this._cameraLookAt );
		}
	
		this._renderer.render( this._scene, this._camera );
	}
	
	p.setDataProvider = function setDataProvider(data)
	{
		var numSteps = 20;
		
		this._dataProvider = data;
		
		var zMin = 1980;
		//var zMin = data.time.minYear;
		var zMax = 2010;
		//var zMax = data.time.maxYear;
		
		this._axisTitles = {};
		this._axisTitles.x = "gdpPerCapita";
		this._axisTitles.y = "hivPrevalence";
		//this._axisTitles.y = "lifeExpectancy";
		this._axisTitles.z = "time";
		this._axisTitles.xTitle = "GDP Per Capita (2005 Int $)";
		this._axisTitles.yTitle = "Estimated HIV Prevalence % (Ages 15-49)";
		//this._axisTitles.yTitle = "Life Expectancy at Birth";
		this._axisTitles.zTitle = "Time";
		
		// Compute Axes
		this._xAxisViewModel.values = this._graphUtils.mapToAxis(data[this._axisTitles.x].minValue, data[this._axisTitles.x].maxValue, numSteps, false);
		this._yAxisViewModel.values = this._graphUtils.mapToAxis(data[this._axisTitles.y].minValue, data[this._axisTitles.y].maxValue, numSteps, true, true);
		this._zAxisViewModel.values = this._graphUtils.mapToAxis(zMin, zMax, numSteps, true);
		
		/*
		this._graphUtils.getLogOfBase(2, 10);
		this._graphUtils.getLogOfBase(10, 10);
		this._graphUtils.getLogOfBase(2, 2);
		this._graphUtils.getLogOfBase(10, 2);
		this._graphUtils.getLogOfBase(85000, 1.5);
		this._graphUtils.getLogOfBase(85000, 1.8);
		this._graphUtils.getLogOfBase(85000, 2);
		this._graphUtils.getLogOfBase(85000, 3);
		*/
		/*
		this._graphUtils.getLogOfBase(25, 10);
		this._graphUtils.getLogOfBase(15, 10);
		this._graphUtils.getLogOfBase(10, 10);
		this._graphUtils.getLogOfBase(5, 10);
		this._graphUtils.getLogOfBase(2.5, 10);
		this._graphUtils.getLogOfBase(1, 10);
		this._graphUtils.getLogOfBase(0.5, 10);
		this._graphUtils.getLogOfBase(0.25, 10);
		this._graphUtils.getLogOfBase(0.1, 10);
		this._graphUtils.getLogOfBase(0.025, 10);
		*/
		// RENDER
		this.enable();
		//console.log("Z (Time) axis minVal "+this._zAxisViewModel.values.minVal+" maxVal "+this._zAxisViewModel.values.maxVal);
	}
	
	p._plotData = function _plotData()
	{
		// draw line for country
		//this._plotData(data.countries["Lesotho"]);
		var regionColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0x00FFFF, 0xFF00FF];
		this._regionColors = {};
		for ( var i = 0; i < this._dataProvider.regions.length; i ++ )
		{
			var region = this._dataProvider.regions[i];
			var color = new THREE.Color();
			//color.setHSV(Math.random(), 1.0, 1.0);
			color.setHex(regionColors[i]);
			this._regionColors[region.name] = color;
		}
		
		this._linesData = { countriesTable: {}, countriesArray: [] };
		
		for ( var countryName in this._dataProvider.countries ) 
		{
			var country = this._dataProvider.countries[countryName];
			color = this._regionColors[country.region.name];
			//var color = new THREE.Color();
			//color.setHSV(Math.random(), 1.0, 1.0);
			var lineValues = this._plotLine(country, color, this._axisTitles.x, this._axisTitles.y);
			lineValues.color = color;
			
			this._linesData.countriesTable[countryName] = lineValues;
			this._linesData.countriesArray.push(lineValues);
		}
		
		this._renderAllLines();
		//this._renderLineByLine();
	}
	
	// Renders all line immediately
	p._renderAllLines = function _renderAllLines()
	{
		for ( var countryName in this._linesData.countriesTable ) 
		{
			var lineValues = this._linesData.countriesTable[countryName];
			
			if (!lineValues.line) {
				lineValues.line = this._createLine(lineValues.lineGeom, lineValues.color);
				this._graphObj.add( lineValues.line );
			}
			
			if (!lineValues.particles) {
				lineValues.particles = this._createParticles(lineValues.particleGeom);
				this._graphObj.add(lineValues.particles);
			}
		}
	}
	
	// Renders each line one by one, point by point
	p._renderLineByLine = function _renderLineByLine()
	{
		this._countryCount = 0;
		this._currentParticleIndex = 0;
		
		var scope = this;
		this._renderDataInterval = setInterval( function() { scope._renderLineByLineInterval() }, 40);
	}
	p._renderLineByLineInterval = function _renderLineByLineInterval()
	{
		if ( this._countryCount == this._linesData.countriesArray.length - 1 )
		{
			clearInterval(this._renderDataInterval);
		}
		
		//var lineValues = this._linesData.countriesTable["Lesotho"];//countryName];
		var lineValues = this._linesData.countriesArray[this._countryCount];//countryName];
		
		if ( this._currentParticleIndex < lineValues.particleGeom.vertices.length + 1 ) 
		{
			lineValues.particleGeomCurrent = new THREE.Geometry();
			lineValues.particleGeomCurrent.colors = lineValues.particleGeom.colors;
				
			lineValues.lineGeomCurrent = new THREE.Geometry();
			
			for ( var i = 0; i < this._currentParticleIndex; i ++ )
			{
				var vector3 = lineValues.lineGeom.vertices[i];
				lineValues.lineGeomCurrent.vertices.push(vector3);
				
				var vector3 = lineValues.particleGeom.vertices[i];
				lineValues.particleGeomCurrent.vertices.push(vector3);
			}
			
			if (lineValues.line)	this._graphObj.remove( lineValues.line );
			lineValues.line = this._createLine(lineValues.lineGeomCurrent, lineValues.color);
			this._graphObj.add( lineValues.line );
			
			if (lineValues.particles)	this._graphObj.remove( lineValues.particles );
			lineValues.particles = this._createParticles(lineValues.particleGeomCurrent);
			this._graphObj.add(lineValues.particles);

			this._currentParticleIndex ++;
		} else {
			this._currentParticleIndex = 0;
			this._countryCount ++;
		}
	}
	
	p._plotLine = function _plotLine(data, color, xTitle, yTitle)
	{
		var minZ = this._zAxisViewModel.values.minVal;
		var maxZ = this._zAxisViewModel.values.maxVal;
		
		// massage data
		// Z-Axis is the axis that X and Y data are plotted against.
		// Loop through the X and Y axes values for the line, storing them on a new object in terms of Z.
		
		var lineValues = { z: {} };
		for ( var zVal in data[xTitle] )
		{
			if ( zVal < minZ || zVal > maxZ ) continue;
			
			var value = data[xTitle][zVal];
			
			if (!lineValues.z[zVal]) {
				lineValues.z[zVal] = {};
			}
			
			lineValues.z[zVal].x = value;
		}
		
		for ( var zVal in data[yTitle] )
		{
			if ( zVal < minZ || zVal > maxZ ) continue;
			
			var value = data[yTitle][zVal];
			if (!lineValues.z[zVal]) {
				lineValues.z[zVal] = {};
			}
			
			lineValues.z[zVal].y = value;
		}
		
		var colors = [];
		
		//init Particles
		var lineGeom = new THREE.Geometry();
		var particleGeom = new THREE.Geometry();

		var prevYValue = 0;
		var prevXValue = 0;
		
		for ( var z in lineValues.z )
		{
			var x = lineValues.z[z].x;
			var y = lineValues.z[z].y;
			//console.log(z+" = "+value);
					
			if (!x) 	x = prevXValue;
			else		prevXValue = x;
			if (!y) 	y = prevYValue;
			else		prevYValue = y;
			
			
			// XPOS
			if ( this._xAxisViewModel.values.logarithmic ) {
				if ( x == 0 ) 	xpos = 0;
				else {
					var stepSize = this._axisLength / this._xAxisViewModel.values.numSteps;
					var numStepsOffset = this._graphUtils.getLogOfBase( x, this._xAxisViewModel.values.base );
					var xpos = numStepsOffset * stepSize;
					xpos += this._xAxisViewModel.values.numFractionalSteps * stepSize;
					//console.log("x "+x+" xpos "+xpos+" stepSize "+stepSize+" numStepsOffset "+numStepsOffset);
				}
			} else  {
				var ratio = this._graphUtils.getRatioAlongAxisLinear( x, this._xAxisViewModel.values.minVal, this._xAxisViewModel.values.maxVal );
				var xpos = ratio * this._axisLength;			
			}

			// YPOS
			if ( this._yAxisViewModel.values.logarithmic ) {
				if ( y == 0 ) 	ypos = 0;
				else {
					var stepSize = this._axisLength / this._yAxisViewModel.values.numSteps;
					var numStepsOffset = this._graphUtils.getLogOfBase( y, this._yAxisViewModel.values.base );
					var ypos = numStepsOffset * stepSize;
					ypos += this._yAxisViewModel.values.numFractionalSteps * stepSize;
					//console.log("y "+y+" ypos "+ypos+" stepSize "+stepSize+" numStepsOffset "+numStepsOffset);
				}
			} else  {			
				var ratio = this._graphUtils.getRatioAlongAxisLinear( y, this._yAxisViewModel.values.minVal, this._yAxisViewModel.values.maxVal );
				var ypos = ratio * this._axisLength;
			}			

			// ZPOS
			if ( this._zAxisViewModel.values.logarithmic ) {
				if ( z == 0 ) 	zpos = 0;
				else {
					var stepSize = this._axisLength / this._zAxisViewModel.values.numSteps;
					var numStepsOffset = this._graphUtils.getLogOfBase( z, this._zAxisViewModel.values.base );
					var zpos = numStepsOffset * stepSize;
					zpos += this._zAxisViewModel.values.numFractionalSteps * stepSize;
					//console.log("z "+z+" zpos "+zpos+" stepSize "+stepSize+" numStepsOffset "+numStepsOffset);
				}			
			} else  {
				var ratio = this._graphUtils.getRatioAlongAxisLinear( z, this._zAxisViewModel.values.minVal, this._zAxisViewModel.values.maxVal );
				var zpos = -ratio * this._axisLength;
			}
			
			var pos = new THREE.Vector3( xpos, ypos, zpos );
			particleGeom.vertices.push(pos);
			lineGeom.vertices.push(pos);
			
			colors.push(color);		
		}
		
		particleGeom.colors = colors;
		
		lineValues.lineGeom = lineGeom;
		lineValues.particleGeom = particleGeom;
		//lineValues.color = color;
		
		return lineValues;
	}
	
	p._createLine = function _createLine(geom, color)
	{
		// lines
		var line = new THREE.Line( geom, new THREE.LineBasicMaterial( { color: color.getHex(), opacity: 0.5 } ) );
		
		return line;
	}
	
	p._createParticles = function _createParticles(geom)
	{
		//create one shared material
		var sprite = THREE.ImageUtils.loadTexture("../files/img/particle2.png");
		var material = new THREE.ParticleBasicMaterial({
			size: 5,
			sizeAttenuation: false,
			map: sprite,
			//blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true,
			vertexColors: true //allows 1 color per particle
		});
		
		//init particle system
		var particles = new THREE.ParticleSystem(geom, material);
		particles.sortParticles = false;
		
		return particles;
	}
	
	// RENDER AXES =================================

	p._createGraphTween = function _createGraphTween(animObj, animTargObj, length, delay, updateCallBack)
	{
		var graphTween = new TWEEN.Tween(animObj);
		graphTween.to(animTargObj, length);
		graphTween.delay(delay);
		graphTween.easing(TWEEN.Easing.Quadratic.EaseInOut);
		if (updateCallBack)		graphTween.onUpdate(updateCallBack);
		graphTween.start();
		
		return graphTween;
	}	
	
	p._renderAxes = function _renderAxes()
	{
		var axisObjs = [{ lineColor:0xff0000, endValue:this._axisLength},
						{ lineColor:0x00ff00, endValue:this._axisLength},
						{ lineColor:0x0000ff, endValue:-this._axisLength}];
		
		var delay = 1000;
		
		this._axesObjects = { lines: [], 
							  gridXY: { aLines: [], bLines: [] }, 
							  gridYZ: { aLines: [], bLines: [] }, 
							  gridXZ: { aLines: [], bLines: [] },
							  animationValues: { lines: [],
												 gridXY: { aLines: [], bLines: [], aAxis: "y", bAxis: "x" }, 
												 gridYZ: { aLines: [], bLines: [], aAxis: "z", bAxis: "y" }, 
												 gridXZ: { aLines: [], bLines: [], aAxis: "z", bAxis: "x" } } };
		
		for ( var i = 0; i < 3; i ++ )
		{
			var axisObj = axisObjs[i];
			var geometry = new THREE.Geometry();
			geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
			geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: axisObj.lineColor, opacity: 1 } ) );
			
			this._graphObj.add( line );
			this._axesObjects.lines.push(line);
			
			var animObj = this._axesObjects.animationValues.lines[i];
			if (!animObj) {
				animObj = this._axesObjects.animationValues.lines[i] = { axisLength:0 };
			}			
			
			// Animate in X,Y,Z Axes
			this._createGraphTween(animObj, {axisLength: axisObj.endValue}, this._animLength, delay, this._updateTimeCallback);
			
			delay += 500;		
		}

		this._xAxisViewModel.renderAxis(delay, this._axisTitles.xTitle, this._graphObj);
		this._yAxisViewModel.renderAxis(delay += 500, this._axisTitles.yTitle, this._graphObj);
		this._zAxisViewModel.renderAxis(delay += 500, this._axisTitles.zTitle, this._graphObj);
	}
	
	// RENDER GRIDS =========================================
	
	p._renderGrid = function _renderGrid( numStepsA, linePosFuncA, numStepsB, linePosFuncB, gridObj, animInitObj )
	{		
		var stepSize = this._axisLength / numStepsA;
		var delay = 0;
		var delayStep = 50;
		
		// Animate in XY, YZ, XZ grids
		for ( var i = 1; i <= numStepsA; i ++ ) 
		{
			var geometry = new THREE.Geometry();
			geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
			geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position = linePosFuncA( i * stepSize );
			
			this._graphObj.add( line );
			gridObj.aLines.push(line);
			
			var animObj = {axisLength: 0};
			animInitObj.aLines.push( animObj );

			this._createGraphTween(animObj, {axisLength: this._axisLength}, 500, delay, this._updateTimeCallback);
						
			delay += delayStep;
		}
		
		var stepSize = this._axisLength / numStepsB;	
		delay = 0;
		
		for ( var i = 1; i <= numStepsB; i ++ ) 
		{
			var geometry = new THREE.Geometry();
			geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
			geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
			
			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position = linePosFuncB( i * stepSize );
			
			this._graphObj.add( line );
			gridObj.bLines.push(line);
			
			var animObj = {axisLength: 0};
			animInitObj.bLines.push( animObj );

			this._createGraphTween(animObj, {axisLength: this._axisLength}, 500, delay, this._updateTimeCallback);
						
			delay += delayStep;			
		}
	}

	p._gridXYLinePosXLines = function _gridXYLinePosXLines( step ) {	return new THREE.Vector3( step, 0, -this._axisLength );		}
	p._gridXYLinePosYLines = function _gridXYLinePosYLines( step ) {	return new THREE.Vector3( 0, step, -this._axisLength );		}
	
	p._gridYZLinePosYLines = function _gridYZLinePosYLines( step ) {	return new THREE.Vector3( 0, step, -this._axisLength );		}
	p._gridYZLinePosZLines = function _gridYZLinePosZLines( step ) {	return new THREE.Vector3( 0, 0, -step );					}
	
	p._gridXZLinePosXLines = function _gridXZLinePosXLines( step ) {	return new THREE.Vector3( step, 0, -this._axisLength );		}
	p._gridXZLinePosZLines = function _gridXZLinePosZLines( step ) {	return new THREE.Vector3( 0, 0, -step );					}
	
	p._renderGridXY = function _renderGridXY()
	{
		var scope = this;
		this._renderGrid( this._xAxisViewModel.values.numSteps, 
						  function(step) { return scope._gridXYLinePosXLines(step); },
						  this._yAxisViewModel.values.numSteps, 
						  function(step) { return scope._gridXYLinePosYLines(step); },
						  this._axesObjects.gridXY, this._axesObjects.animationValues.gridXY );
	}
	
	p._renderGridYZ = function _renderGridYZ()
	{
		var scope = this;
		this._renderGrid( this._yAxisViewModel.values.numSteps, 
						  function(step) { return scope._gridYZLinePosYLines(step); },
						  this._zAxisViewModel.values.numSteps, 
						  function(step) { return scope._gridYZLinePosZLines(step); },
						  this._axesObjects.gridYZ, this._axesObjects.animationValues.gridYZ );
	}
	
	p._renderGridXZ = function _renderGridXZ()
	{
		var scope = this;
		this._renderGrid( this._xAxisViewModel.values.numSteps, 
						  function(step) { return scope._gridXZLinePosXLines(step); },
						  this._zAxisViewModel.values.numSteps, 
						  function(step) { return scope._gridXZLinePosZLines(step); },
						  this._axesObjects.gridXZ, this._axesObjects.animationValues.gridXZ );
	}
}

})();	