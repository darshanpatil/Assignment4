//Import required frameworks
var http = require("http");
var url = require("url");
var fs = require("fs");
var js2xmlparser = require("js2xmlparser");
//Read JSON file
var jsonObj = require("./Source/source.json");
//Port number constant on which server will start
const PORT = 9090;

//Create basic http server
var server = http.createServer(handleRequest);

//Read Students object from JSON
var students = jsonObj.student;

//Handle function after starting http server
//This function will handle all incoming requests
function handleRequest(req, res) {
	var reqMethod = req.method;
	var str = '';
	var resultJSON = '';
	//Response support variable
	var txtSupport = false;
	var xmlSupport = false;
	var jsonSupport = false;
	
	//Proceed only if 'GET' request method
	if(reqMethod != 'GET') {
		res.writeHead(500);
		res.end(reqMethod + " : request method not supported.");
	}
	
	//Read query string parameters
	var query = url.parse(req.url, true).query;
	
	//Check if 'q' parameter is present in query string
	if(query.q) {
		str = query.q;
	}
	
	//Filter Student JSON object for searched word (first name based search)
	var resultArray = students.filter(filterJSON);
	
	//Actual filter function
	function filterJSON(val) {
		var name = val.fName;
		//Case insensitive first name match
		if(name.toUpperCase().indexOf(str.toUpperCase()) != -1) {
			return val;
		}
	}
	
	//Sort the result from filter in descending order
	resultArray.sort(sort_by('score', true, parseInt));
	
	//Check the 'Accept' request header to send appropriate response
	var acceptHeaders = req.headers.accept.split(',');
	
	for(var header in acceptHeaders) {
		if(acceptHeaders[header].toUpperCase().indexOf('text'.toUpperCase()) != -1) {
			txtSupport = true;
		}
		if(acceptHeaders[header].toUpperCase().indexOf('xml'.toUpperCase()) != -1) {
			xmlSupport = true;
		}
		if(acceptHeaders[header].toUpperCase().indexOf('json'.toUpperCase()) != -1) {
			jsonSupport = true;
		}
	}
	
	//Send the response according to request 'Accept' header
	if(jsonSupport) {
		//JSON response
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(JSON.stringify(resultArray));
	} else if(xmlSupport) {
		//XNL response
		res.writeHead(200, {"Content-Type": "application/xml"});
		var xmlData = js2xmlparser("Students", JSON.stringify(resultArray));
		res.write(xmlData);
		res.end();
	} else {
		//PLain response
		//Generate html table to show response data
		res.writeHead(200, {"Content-Type": "text/html"});
		var data = '<html><body><table border="1"><tr><th>Id</th><th>First Name</th><th>Last Name</th><th>Score</th></tr>';
		
		for(var stud in resultArray) {
			data  = data + '<tr><td>' + resultArray[stud].id + "</td><td>" + resultArray[stud].fName + "</td><td>" + resultArray[stud].lName + "</td><td>" + resultArray[stud].score + "</td></tr>";
		}
		data = data + '</table></body></html>';
		res.write(data);
		res.end();
	}
}

//Sort array by any columnName, sortOrder, dataType(for int pass 'parseInt', for float pass 'parseFloat')
var sort_by = function(field, reverse, primer){

   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}

//Start basic http server to listen request on port specified by PORT
server.listen(PORT, function() {
	console.log("[INFO] Server started on port: " + PORT);
});