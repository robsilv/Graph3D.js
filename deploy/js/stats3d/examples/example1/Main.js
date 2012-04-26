(function(){

	var GraphView = STATS3D.namespace("STATS3D.common.ui.views").GraphView;
	
	var regions = [];
	var countries = {};	// countries lookup table

	document.addEventListener("DOMContentLoaded", (function ()
	{
		console.log("DOMContentLoaded");
		
		var graphView = GraphView.create();
		
		
        // createChart();           
        loadRegionsCSV("../files/data/Geographic Regions.csv"); 
		
	}), false);
	
    function loadRegionsCSV(file) 
	{
        if (window.XMLHttpRequest) {
            // IE7+, Firefox, Chrome, Opera, Safari
            var request = new XMLHttpRequest();
        }
        else {
            // code for IE6, IE5
            var request = new ActiveXObject('Microsoft.XMLHTTP');
        }
        // load
        request.open('GET', file, false);
        request.send();
        parseRegions(request.responseText);
		
		loadPopulationsCSV("../files/data/Population.csv"); 
    }
	
	function loadPopulationsCSV(file)
	{
        if (window.XMLHttpRequest) {
            // IE7+, Firefox, Chrome, Opera, Safari
            var request = new XMLHttpRequest();
        }
        else {
            // code for IE6, IE5
            var request = new ActiveXObject('Microsoft.XMLHTTP');
        }
        // load
        request.open('GET', file, false);
        request.send();
        parsePopulations(request.responseText);
	}

    function parseRegions(data)
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
			regions.push({region:column[i], countries:[]});        
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
						var region = regions[j];
						var country = column[j];
						if (region) {
							if (country.length > 0 ) {
								var countryObj = { country:country };
								region.countries.push(countryObj);
								countries[country] = countryObj;
							}
						} else {
							console.log("NO REGION "+j+" country "+column[j]);
						}
					}
				}
			}
		}
	}
	
	function parsePopulations(data)
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
		
		console.log("YEARS "+years);
		
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
				var country = countries[countryName];
				
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
	
	
})();