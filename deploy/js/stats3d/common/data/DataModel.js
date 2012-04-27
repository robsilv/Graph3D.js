(function(){

var namespace = STATS3D.namespace("STATS3D.common.data");
	
var ListenerFunctions = STATS3D.namespace("STATS3D.utils.events").ListenerFunctions;
var TextLoader = STATS3D.namespace("STATS3D.utils.loading").TextLoader;
var EventDispatcher = STATS3D.namespace("STATS3D.utils.events").EventDispatcher;

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
		this._populationLoadedCallback = ListenerFunctions.createListenerFunction(this, this._populationsLoaded);
		this._hivLoadedCallback = ListenerFunctions.createListenerFunction(this, this._hivLoaded);
		
		this._regionsUrl = "../files/data/Geographic_Regions.csv";
		this._populationUrl = "../files/data/Population.csv";
		this._hivPrevUrl = "../files/data/Estimated_HIV_Prevalence_Ages_15-49.csv";
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
		this._regionsLoader = this._createLoader(this._regionsUrl, this._regionsLoadedCallback);
		this._regionsLoader.load();	
	}
	
	p._regionsLoaded = function _regionsLoaded(aEvent) 
	{	
		var data = this._regionsLoader.getData();
		//console.log("REGIONS LOADER DATA "+data);
		
		this._parseRegions(data);

		this._populationLoader = this._createLoader(this._populationUrl, this._populationLoadedCallback);
		this._populationLoader.load();		
	};
	p._populationsLoaded = function _populationsLoaded(aEvent) 
	{	
		var data = this._populationLoader.getData();
		//console.log("POPULATIONS LOADER DATA "+data);
		
		var scope = this;
		this._parseTable(data, function(column, years, i) { scope._parsePopulation(column, years, i) });
		
		this._hivLoader = this._createLoader(this._hivPrevUrl, this._hivLoadedCallback);
		this._hivLoader.load();
	};
	p._hivLoaded = function _hivLoaded(aEvent)
	{
		var data = this._hivLoader.getData();
		
		var scope = this;
		this._parseTable(data, function(column, years, i) { scope._parseHIVPrev(column, years, i) });
		
		this.dispatchEvent( { type:"loadComplete" } );
	}
	
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
			this._global.regions.push({region:column[i], countries:[]});        
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
	
	p._parsePopulation = function _parsePopulation(column, years, i)
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
				if (!global.population) {
					global.population = { minYear:10000, maxYear:0, minValue:10000000000, maxValue:0 };
				}
				
				var region = country.region;
				if (!region.population) {
					region.population = { minYear:10000, maxYear:0, minValue:10000000000, maxValue:0 };
				}
				
				for (var j = 0; j < column.length; j++)
				{
					var pop = parseFloat(column[j]);
					if (!isNaN(pop)) {
						var year = parseInt(years[j]);
						
						//console.log(rowTitle+" : "+year+" : "+pop);
						if (!country.population) {
							country.population = {};
						}
						country.population[year] = pop;
						
						// set region bounds
						this._setBounds(region.population, year, pop, country);
						// set global bounds
						this._setBounds(global.population, year, pop, country);
					}
				}
			} else {
				console.log("Entry for \""+rowTitle+"\" in Pop.csv but not in Regions.csv");
			}
		}	
	}
	
	p._parseHIVPrev = function _parseHIVPrev(column, years, i)
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
				if (!global.hivPrevalence) {
					global.hivPrevalence = { minYear:10000, maxYear:0, minValue:10000000000, maxValue:0 };
				}
				
				var region = country.region;
				if (!region.hivPrevalence) {
					region.hivPrevalence = { minYear:10000, maxYear:0, minValue:10000000000, maxValue:0 };
				}
				
				for (var j = 0; j < column.length; j++)
				{
					var value = parseFloat(column[j]);
					if (!isNaN(value)) {
						var year = parseInt(years[j]);
						//console.log("HIV "+rowTitle+" : "+year+" : "+value);
						
						if (!country.hivPrevalence) {
							country.hivPrevalence = {};
						}
						country.hivPrevalence[year] = value;
						
						// set region bounds
						this._setBounds(region.hivPrevalence, year, value, country);
						// set global bounds
						this._setBounds(global.hivPrevalence, year, value, country);
					}
				}
			} else {
				console.log("Entry for \""+rowTitle+"\" in Pop.csv but not in HIV.csv");
			}
		}		
	}
	
	p._setBounds = function _setBounds(obj, year, value, country)
	{
		if ( year > obj.maxYear )
			obj.maxYear = year;
		if ( year < obj.minYear )
			obj.minYear = year;						
		
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
	}
	
	p.getData = function getData()
	{
		return this._global;
	}
	
}

})();	