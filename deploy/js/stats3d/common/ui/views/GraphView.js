(function(){

var namespace = STATS3D.namespace("STATS3D.common.ui.views");
var GraphUtils = STATS3D.namespace("STATS3D.common.data").GraphUtils;
//var EventDispatcher = STATS3D.namespace("STATS3D.utils.events").EventDispatcher;

if(namespace.GraphView === undefined) 
{
	var GraphView = function GraphView() {
		this._init();
		this._animate();
	};
	
	namespace.GraphView = GraphView;
		
	var p = GraphView.prototype = {};//new EventDispatcher();
	
	GraphView.create = function create() 
	{
		var newGraphView = new GraphView();
		return newGraphView;
	};	
	
	p._init = function _init()
	{
		//var container, stats;
		//var camera, scene, renderer;
		this.dataProvider = null;
		this._graphUtils = GraphUtils.create();
		
		this._offsetTop = 400;
		
		this._container = document.createElement( 'div' );
		document.body.appendChild( this._container );

		this._camera = new THREE.CombinedCamera( window.innerWidth /2, window.innerHeight/2, 70, 1, 1000, -1000, 1000, 1000 );

		this._camera.position.x = 0//200;
		this._camera.position.y = this._offsetTop;
		this._camera.position.z = 0//200;

		this._scene = new THREE.Scene();

		this._scene.add( this._camera );
		this._scene.position.y = this._offsetTop;

		
		this._axisLength = 1000;
		
		// Grid

		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( this._axisLength, 0, 0 ) );

		for ( var i = 0; i <= 20; i ++ ) {

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.z = ( i * 50 );
			this._scene.add( line );

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.x = ( i * 50 );
			line.position.z = this._axisLength;
			line.rotation.y = 90 * Math.PI / 180;
			this._scene.add( line );

		}

		// Cubes

		var geometry = new THREE.CubeGeometry( 50, 50, 50 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: true } );

		
		for ( var i = 0; i < 100; i ++ ) {

			var cube = new THREE.Mesh( geometry, material );

			cube.scale.y = Math.floor( Math.random() * 2 + 1 );

			cube.position.x = Math.floor( ( Math.random() * 1000 ) / 50 ) * 50 + 25;
			cube.position.y = ( cube.scale.y * 50 ) / 2;
			cube.position.z = Math.floor( ( Math.random() * 1000 ) / 50 ) * 50 + 25;

			this._scene.add(cube);

		}
		
		var cube = new THREE.Mesh( geometry, material );

		cube.position.x = 500;
		cube.position.y = 500;
		cube.position.z = 500;
		this._scene.add(cube);
		
		// X-AXIS (red)
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( this._axisLength, 0, 0 ) );

		var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xff0000, opacity: 0.5 } ) );
		this._scene.add( line );
	
		// Y-AXIS (green)
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, this._axisLength, 0 ) );

		var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x00ff00, opacity: 0.5 } ) );
		this._scene.add( line );
		
		// Z-AXIS (blue)
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, 0, this._axisLength ) );

		var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x0000ff, opacity: 0.5 } ) );
		this._scene.add( line );			
		

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

		this._renderer = new THREE.CanvasRenderer();
		this._renderer.setSize( window.innerWidth, window.innerHeight );

		this._container.appendChild( this._renderer.domElement );

		this._stats = new Stats();
		this._stats.domElement.style.position = 'absolute';
		this._stats.domElement.style.top = '0px';
		this._container.appendChild( this._stats.domElement );

		var scope = this;
		window.addEventListener( 'resize', function() { scope._onWindowResize() }, false );
		
		document.addEventListener( 'mousemove', function(event) { scope._onDocumentMouseMove(event) }, false );
		
		this.enable();
	}
	
	p._onWindowResize = function _onWindowResize() 
	{
		this._camera.setSize( window.innerWidth, window.innerHeight );
		this._camera.updateProjectionMatrix();

		this._renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	p._onDocumentMouseMove = function _onDocumentMouseMove( event ) 
	{
		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;
		
		this._mouseX = ( event.clientX - windowHalfX );
		this._mouseY = ( event.clientY - windowHalfY );
	}	
	
	p.destroy = function destroy() 
	{
	
	};
	
	p.enable = function enable()
	{
		this.setOrthographic();
		this.setLens(12);
		this.toOverView();
		
		//this._topViewButton = document.getElementById("topView");
		this._bottomViewButton = document.getElementById("bottomView");
		this._leftViewButton = document.getElementById("leftView");
		//this._rightViewButton = document.getElementById("rightView");
		this._frontViewButton = document.getElementById("frontView");
		//this._backViewButton = document.getElementById("backView");
		this._overViewButton = document.getElementById("overView");
		
		var scope = this;
		
		//this._topViewButton.addEventListener( "click", function() { scope.toTopView(); } );
		this._bottomViewButton.addEventListener( "click", function() { scope.toBottomView(); } );
		this._leftViewButton.addEventListener( "click", function() { scope.toLeftView(); } );
		//this._rightViewButton.addEventListener( "click", function() { scope.toRightView(); } );
		this._frontViewButton.addEventListener( "click", function() { scope.toFrontView(); } );
		//this._backViewButton.addEventListener( "click", function() { scope.toBackView(); } );
		this._overViewButton.addEventListener( "click", function() { scope.toOverView(); } );
		
		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;
		
		//this._mouseX =  window.innerWidth / 4 * 3;
		//this._mouseY =  0 - window.innerHeight;
		//this._mouseX = 1000;
		//this._mouseY = 1000;
		
	};
	p.disable = function disable()
	{

	};
	
	p._toFixedView = function _toFixedView()
	{
		this._rotating = false;
		this._camera.position.x = 0;
		this._camera.position.y = 0;
		this._camera.position.z = 0;		
	}
	p._toDynamicView = function _toDynamicView()
	{
		this._rotating = true;
		this._camera.position.x = 200;
		this._camera.position.y = 100;
		this._camera.position.z = 200;	
	}
	
	/*
	p.toTopView = function toTopView()
	{
		this._toFixedView();
		this._camera.toTopView();
	}
	p.toRightView = function toRightView()
	{
		this._toFixedView();
		this._camera.toRightView();
	}
	p.toBackView = function toBackView()
	{
		this._toFixedView();
		this._camera.toBackView();
	}
	*/
	
	p.toBottomView = function toBottomView()
	{
		this._toFixedView();
		this._camera.toBottomView();
		this._camera.position.z = this._offsetTop;
	}
	p.toLeftView = function toLeftView()
	{
		this._toFixedView();
		this._camera.toLeftView();
		this._camera.position.y = this._offsetTop;
	}
	p.toFrontView = function toFrontView()
	{
		this._toFixedView();
		this._camera.toFrontView();
		this._camera.position.y = this._offsetTop;
	}
	p.toOverView = function toOverView()
	{
		this._toDynamicView();
		this._camera.rotationAutoUpdate = true;
		//this._camera.position.y = this._offsetTop;
	}
	
	p.setFov = function setFov( fov )
	{
		this._camera.setFov( fov );

		document.getElementById('fov').innerHTML = 'FOV '+ fov.toFixed(2) +'&deg;' ;
	}

	p.setLens = function setLens( lens ) 
	{
		// try adding a tween effect while changing focal length, and it'd be even cooler!

		var fov = this._camera.setLens( lens );

		document.getElementById('fov').innerHTML = 'Converted ' + lens + 'mm lens to FOV '+ fov.toFixed(2) +'&deg;' ;
	}

	p.setOrthographic = function setOrthographic() 
	{
		this._camera.toOrthographic();

		document.getElementById('fov').innerHTML = 'Orthographic mode' ;
	}

	p.setPerspective = function setPerspective() 
	{
		this._camera.toPerspective();

		document.getElementById('fov').innerHTML = 'Perspective mode' ;
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
	/*
		if ( this._rotating )
		{
			var timer = Date.now() * 0.0001;
			this._camera.position.x = Math.cos( timer ) * 200;
			this._camera.position.z = Math.sin( timer ) * 200;
			this._camera.lookAt( this._scene.position );
		}
	*/
	
		if ( this._rotating )
		{
			var multiplier = 0.1;//05;
			var xInc = ( this._mouseX - this._camera.position.x ) * multiplier;
			var yInc = ( - this._mouseY + this._offsetTop - this._camera.position.y ) * multiplier;
			
			if (xInc) this._camera.position.x += xInc;
			if (yInc) this._camera.position.y += yInc;
			
			this._camera.lookAt( this._scene.position );
		}
	
		this._renderer.render( this._scene, this._camera );
	}
	
	p.setDataProvider = function setDataProvider(data)
	{
		var numSteps = 20;
		
		this._dataProvider = data;
		this._yAxisValues = this._graphUtils.mapToAxis(data.hivPrevalence.minValue, data.hivPrevalence.maxValue, numSteps);
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( -20, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );

		for ( var i = 0; i <= numSteps; i ++ ) {

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.y = ( i * (this._axisLength/numSteps) );
			this._scene.add( line );

		}		
		
		//this._graphUtils.mapToAxis(data.population.minValue, data.population.maxValue, 20);
	}
}

})();	