var http = require("http");
var url = require("url");
var fs = require("fs");
var js2xmlparser = require("js2xmlparser");
var jsonObj = require("./Source/source.json");
const PORT = 9090;

var server = http.createServer(handleRequest);

var students = jsonObj.student;

function handleRequest(req, res) {
	var reqMethod = req.method;
	var str = '';
	var resultJSON = '';
	var txtSupport = false;
	var xmlSupport = false;
	var jsonSupport = false;
	
	if(reqMethod != 'GET') {
		res.writeHead(500);
		res.end(reqMethod + " : request method not supported.");
	}
	
	var query = url.parse(req.url, true).query;
	
	if(query.q) {
		str = query.q;
	}
	
	var resultArray = students.filter(filterJSON);
	
	function filterJSON(val) {
		var name = val.fName;
		if(name.toUpperCase().indexOf(str.toUpperCase()) != -1) {
			return val;
		}
	}
	console.log(resultArray);
	resultArray.sort(sort_by('score', true, parseInt));
	
	var acceptHeaders = req.headers.accept.split(',');
	console.log(acceptHeaders);
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
	
	if(jsonSupport) {
		console.log("JSON Response");
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(JSON.stringify(resultArray));
	} else if(xmlSupport) {
		console.log("XML Response");
		res.writeHead(200, {"Content-Type": "application/xml"});
		var xmlData = js2xmlparser("Students", resultArray);
		res.write(xmlData);
		res.end();
	} else {
		console.log("Plain Response");
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

server.listen(PORT, function() {
	console.log("[INFO] Server started on port: " + PORT);
});