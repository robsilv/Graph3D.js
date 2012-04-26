(function(){

var namespace = STATS3D.namespace("STATS3D.common.data");
	
var ListenerFunctions = STATS3D.namespace("STATS3D.utils.events").ListenerFunctions;
var TextLoader = STATS3D.namespace("STATS3D.utils.loading").TextLoader;
//var EventDispatcher = STATS3D.namespace("STATS3D.utils.events").EventDispatcher;

if(namespace.DataModel === undefined) 
{
	var DataModel = function DataModel() {
		this._init();
	};
	
	namespace.DataModel = DataModel;
		
	var p = DataModel.prototype = {};//new EventDispatcher();
	
	DataModel.create = function create() 
	{
		var newInstance = new DataModel();
		return newInstance;
	};	
	
	p._init = function _init()
	{
		this._regions = [];
		this._countries = {};	// countries lookup table
		
		this._regionsLoadedCallback = ListenerFunctions.createListenerFunction(this, this._regionsLoaded);
		this._populationLoadedCallback = ListenerFunctions.createListenerFunction(this, this._populationsLoaded);
		this._hivLoadedCallback = ListenerFunctions.createListenerFunction(this, this._hivLoaded);
		
		this._regionsUrl = "../files/data/Geographic_Regions.csv";
		this._populationUrl = "../files/data/Population.csv";
		this._hivPrevUrl = "../files/data/Estimated_HIV_Prevalence_Ages_15-49.csv";
		
		var newLoader = TextLoader.create(this._regionsUrl);
		newLoader.addEventListener(TextLoader.LOADED, this._regionsLoadedCallback, false);
		this._regionsLoader = newLoader;
		newLoader.load();		
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
	
	p._regionsLoaded = function _regionsLoaded(aEvent) 
	{	
		var data = this._regionsLoader.getData();
		//console.log("REGIONS LOADER DATA "+data);
		
		this._parseRegions(data);
		
		var newLoader = TextLoader.create(this._populationUrl);
		newLoader.addEventListener(TextLoader.LOADED, this._populationLoadedCallback, false);
		this._populationLoader = newLoader;
		newLoader.load();					
	};
	p._populationsLoaded = function _populationsLoaded(aEvent) 
	{	
		var data = this._populationLoader.getData();
		//console.log("POPULATIONS LOADER DATA "+data);
		
		this._parsePopulations(data);
		
		var newLoader = TextLoader.create(this._hivPrevUrl);
		newLoader.addEventListener(TextLoader.LOADED, this._hivLoadedCallback, false);
		this._hivLoader = newLoader;
		newLoader.load();
	};
	p._hivLoaded = function _hivLoaded(aEvent)
	{
		var data = this._populationLoader.getData();
		
		this._parseHIVPrev(data);
	}
	
    p._parseRegions = function _parseRegions(data)
	{
		//alert(data);

		//replace UNIX new line
		data = data.replace (/\r\n/g, "\n");
		//replace MAC new lines
		data = data.replace (/\r/g, "\n");
		//split into rows
		var rows = data.split("\n");

		// X-Axis headers
		var column = rows[0].split(",");
		// remove chart title from array
		//column.shift();
		
		// store column titles
		for (var i = 0; i < column.length; i ++) 
		{
			this._regions.push({region:column[i], countries:[]});        
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
						var region = this._regions[j];
						var country = column[j];
						if (region) {
							if (country.length > 0 ) {
								var countryObj = { country:country };
								region.countries.push(countryObj);
								this._countries[country] = countryObj;
							}
						} else {
							console.log("NO REGION "+j+" country "+column[j]);
						}
					}
				}
			}
		}
	}
	
	p._parsePopulations = function _parsePopulations(data)
	{
		//alert(data);

		//replace UNIX new line
		data = data.replace (/\r\n/g, "\n");
		//replace MAC new lines
		data = data.replace (/\r/g, "\n");
		//split into rows
		var rows = data.split("\n");

		// X-Axis headers
		var column = rows[0].split(",");
		// remove chart title from array
		column.shift();

		var years = [];
		//var countries = {};	// countries lookup table
		
		// store column titles
		for (var i = 0; i < column.length; i ++) 
		{
			years.push(column[i]);        
		}
		
		console.log("POP YEARS "+years);
		
		// loop through all rows
		for (var i = 0; i < rows.length; i++)
		{
			  // this line helps to skip empty rows
			if (rows[i]) 
			{                   
				  // our columns are separated by comma
				var column = rows[i].split(",");
				// remove row title element
				var countryName = column.shift();				
				var country = this._countries[countryName];
				
				// skip col titles row
				if (i != 0) 
				{
					if (country) 
					{
						for (var j = 0; j < column.length; j++)
						{
							var value = parseFloat(column[j]);
							if (!isNaN(value)) {
								var year = years[j];
								var pop = value;
								//console.log(countryName+" : "+year+" : "+pop);
								if (!country.population) {
									country.population = {};
								}
								country.population[year] = pop;
							}
						}
					} else {
						console.log("Entry for \""+countryName+"\" in Pop.csv but not in Regions.csv");
					}
				}
			}
		}
	}

	p._parseHIVPrev = function _parseHIVPrev(data)
	{
		data = data.replace (/\r\n/g, "\n");
		//replace MAC new lines
		data = data.replace (/\r/g, "\n");
		//split into rows
		var rows = data.split("\n");

		// X-Axis headers
		var column = rows[0].split(",");
		// remove chart title from array
		column.shift();

		var years = [];
		//var countries = {};	// countries lookup table
		
		// store column titles
		for (var i = 0; i < column.length; i ++) 
		{
			years.push(column[i]);        
		}
		
		console.log("HIV YEARS "+years);	
	}
	
				/*
				// remove row title element
				//var country = column.shift();
				// skip col titles row
				if (i != 0) {
				var newCol = [];

				// store row titles
				countryNames.push(country);

				for (var j = 0; j < column.length; j++){
				var value = parseFloat(column[j]);
				if (!isNaN(value)){
				// round to 2 dp
				value *= 100;
				value = Math.round(value);
				value /= 100;

				//                   console.log(value);
				maxDataVal = Math.max(value, maxDataVal);
				newCol.push(value);
				}
				}
				countriesData.push(newCol);

				}
				*/
              // first item is date
//              var date = column[0]//parseDate(column[0]);
              // second item is value of the second column
//              var value1 = column[1];
              // third item is value of the fird column
//              var value2 = column[2];
              // create object which contains all these items:
//              var dataObject = {date:date, value1:value1, value2:value2};
              // add object to dataProvider array
//              dataProvider.push(dataObject);	
		
	
}

})();	