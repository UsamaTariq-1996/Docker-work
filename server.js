var fs = require('fs');
var express = require('express');
var nano = require('nano')(`http://admin:password@${process.env.DATABASE_IP}:5984`); // Connect to the CouchDB running on port 5984
var app = express();
var db_name = 'test'; // The name of the database to connect to
var db;
nano.db.create(db_name,function() {
	db = nano.use(db_name);
	console.log("DATABASE CREATED!");

	
	// Populate the `test` database with data from `test_data.json`
	fs.readFile('./test_data.json',function(err, data){
		var aData = JSON.parse(data);
		for (var n = 0; n < aData.length; n++){
			insertDoc(aData[n],0);
		}
	});

});
 

function insertDoc(doc, tried){
	db.insert(doc, function(err, http_body, http_headers){
		if(err){
			if(err.message === 'no_db_file' && tried < 1){
				return nano.db.create(db_name,function(){
					insert_doc(doc, tried+1);
				});
			} else {
				return console.log(err);
			}
		}
	});
}

// Start the server
app.listen(3000, function() {
    console.log("Express server is listening on port", 3000);
});

// Configure our app to serve static files from the current directory
app.use(express.static('./'));

// Display `index.html` when localhost:3000 is requested
app.get('/', function (req, res) {
  res.sendFile('./index.html', {root: './'});
});

// Send all records when there's a GET request to `localhost:3000/test`
app.get('/test', function (req, res) {
	db.list({ include_docs: true }, function(err, body){
		res.send(body);
	});
});
