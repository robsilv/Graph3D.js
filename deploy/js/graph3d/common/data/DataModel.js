(function(){

var namespace = GRAPH3D.namespace("GRAPH3D.common.data");
	
var ListenerFunctions = GRAPH3D.namespace("GRAPH3D.utils.events").ListenerFunctions;
var TextLoader = GRAPH3D.namespace("GRAPH3D.utils.loading").TextLoader;
var EventDispatcher = GRAPH3D.namespace("GRAPH3D.utils.events").EventDispatcher;

if(namespace.DataModel === undefined) 
{
	var DataModel = function DataModel() {
		this._init();
	};
	
	namespace.DataModel = DataModel;
		
	var p = DataModel.prototype = new EventDispatcher();
	
	DataModel.create = function create() 
	{
		var newInstance = new DataModel();
		return newInstance;
	};	
	
	p._init = function _init()
	{
		this._global = { regions:[], countries:{} };
		
		this._regionsLoadedCallback = ListenerFunctions.createListenerFunction(this, this._regionsLoaded);
		this._tableLoadedCallback = ListenerFunctions.createListenerFunction(this, this._tableLoaded);
		
		this._regionsUrl = "../files/data/Geographic_Regions.csv";

		this._loadNum	= 0;
		this._loadQueue = [ { title: "population", url: "../files/data/Population.csv" },
							{ title: "hivPrevalence", url: "../files/data/Estimated_HIV_Prevalence_Ages_15-49.csv" },
							{ title: "gdpPerCapita", url: "../files/data/GDP_per_capita_(1800-2010)_2005_Int_dollars.csv" },
							{ title: "lifeExpectancy", url: "../files/data/Life_Expectancy_At_Birth.csv" }];
	}
	
	p.destroy = function destroy() 
	{
	
	};
	
	p.enable = function enable()
	{

		
	};
	p.disable = function disable()
	{

	};
	
	p._createLoader = function _createLoader(url, callBack)
	{
		var newLoader = TextLoader.create(url);
		newLoader.addEventListener(TextLoader.LOADED, callBack, false);
		
		return newLoader;
	}
	
	p.load = function load()
	{
		this._csvLoader = this._createLoader(this._regionsUrl, this._regionsLoadedCallback);
		this._csvLoader.load();	
	}
	
	p._regionsLoaded = function _regionsLoaded(aEvent) 
	{	
		var data = this._csvLoader.getData();
		//console.log("REGIONS LOADER DATA "+data);
		
		this._parseRegions(data);

		this._loadNext();	
	};
	
	p._loadNext = function _loadNext()
	{
		this._currLoadObj = this._loadQueue[this._loadNum];
		
		if ( this._loadNum < this._loadQueue.length )
		{
			this._loadNum ++;
			
			this._csvLoader = this._createLoader(this._currLoadObj.url, this._tableLoadedCallback);
			this._csvLoader.load();
		} else {
			this.dispatchEvent( { type:"loadComplete" } );
		}
	};
	
	p._tableLoaded = function _tableLoaded(aEvent) 
	{	
		var data = this._csvLoader.getData();
		//console.log("POPULATIONS LOADER DATA "+data);

		var scope = this;
		this._parseTable(data, function(column, years, i) { scope._parseColumn(scope._currLoadObj.title, column, years, i) });
	
		this._loadNext();
	};
	
	p._cleanData = function _cleanData(data)
	{
		//replace UNIX new line
		data = data.replace (/\r\n/g, "\n");
		//replace MAC new lines
		data = data.replace (/\r/g, "\n");
		
		return data;
	}
	
    p._parseRegions = function _parseRegions(data)
	{
		data = this._cleanData(data);
		
		//split into rows
		var rows = data.split("\n");

		// X-Axis headers
		var column = rows[0].split(",");
		// remove chart title from array
		//column.shift();
		
		// store column titles
		for (var i = 0; i < column.length; i ++) 
		{
			this._global.regions.push({name:column[i], countries:[]});        
		}

		// loop through all rows
		for (var i = 0; i < rows.length; i++)
		{
			  // this line helps to skip empty rows
			if (rows[i]) 
			{                   
				  // our columns are separated by comma
				var column = rows[i].split(",");
				
				// skip col titles row
				if (i != 0) 
				{
					for ( var j = 0; j < column.length; j ++ )
					{
						var region = this._global.regions[j];
						var country = column[j];
						if (region) {
							if (country.length > 0 ) {
								var countryObj = { name:country, region:region };
								region.countries.push(countryObj);
								this._global.countries[country] = countryObj;
							}
						} else {
							console.log("NO REGION "+j+" country "+column[j]);
						}
					}
				}
			}
		}
	}
	
	p._parseTable = function _parseTable(data, parseFunc)
	{
		data = this._cleanData(data);
		
		//split into rows
		var rows = data.split("\n");

		// X-Axis headers
		var column = rows[0].split(",");
		// remove chart title from array
		column.shift();

		var titles = [];
		
		// store column titles
		for (var i = 0; i < column.length; i ++) 
		{
			titles.push(column[i]);        
		}
		
		console.log("Column Titles "+titles);
		
		// loop through all rows
		for (var i = 0; i < rows.length; i++)
		{
			  // this line helps to skip empty rows
			if (rows[i]) 
			{                   
				  // our columns are separated by comma
				var column = rows[i].split(",");
				
				parseFunc(column, titles, i);
			}
		}
		
		return titles;
	}
	
	p._parseColumn = function _parseColumn(prop, column, years, i)
	{
		// remove row title element
		var rowTitle = column.shift();				
		var country = this._global.countries[rowTitle];
		
		// skip col titles row
		if (i != 0) 
		{
			if (country) 
			{
				var global = this._global;
				if (!global[prop]) {
					global[prop] = { minYear:10000, maxYear:0, minValue:10000000000, maxValue:0 };
				}
				if (!global.time) {
					global.time = { minYear:10000, maxYear:0 };
				}
				
				var region = country.region;
				if (!region[prop]) {
					region[prop] = { minYear:10000, maxYear:0, minValue:10000000000, maxValue:0 };
				}
				if (!region.time) {
					region.time = { minYear:10000, maxYear:0 };
				}				
				
				for (var j = 0; j < column.length; j++)
				{
					var value = parseFloat(column[j]);
					if (!isNaN(value)) {
						var year = parseInt(years[j]);
						//console.log("HIV "+rowTitle+" : "+year+" : "+value);
						
						if (!country[prop]) {
							country[prop] = {};
						}
						country[prop][year] = value;
						
						if (!country.time) {
							country.time = { minYear:10000, maxYear:0 };
						}
						
						// set region bounds
						this._setBounds(region[prop], year, value, country);
						// set global bounds
						this._setBounds(global[prop], year, value, country);
						
						//set time max/min bounds for all country data
						this._setYearBounds(country.time, year);
						//set time max/min bounds for all region data
						this._setYearBounds(region.time, year);
						//set time max/min bounds for all global data
						this._setYearBounds(global.time, year);
					}
				}
			} else {
				console.log("Entry for \""+rowTitle+"\" in Pop.csv but not in XXX.csv");
			}
		}
	}
	
	p._setBounds = function _setBounds(obj, year, value, country)
	{
		obj = this._setYearBounds(obj, year);
		obj = this._setValueBounds( obj, year, value, country );
	}
	p._setYearBounds = function _setYearBounds(obj, year)
	{
		if ( year > obj.maxYear )
			obj.maxYear = year;
		if ( year < obj.minYear )
			obj.minYear = year;
			
		return obj;
	}
	p._setValueBounds = function _setValueBounds( obj, year, value, country )
	{
		if ( value > obj.maxValue )
		{
			obj.maxValue = value;
			obj.maxValueCountry = country;
			obj.maxValueYear = year;
		}
		if ( value < obj.minValue )
		{
			obj.minValue = value;
			obj.minValueCountry = country;
			obj.minValueYear = year;
		}
		
		return obj;
	}
	
	p.getData = function getData()
	{
		return this._global;
	}
	
}

})();	