// server.js

const express = require("express");
const server = express();

const body_parser = require("body-parser");

// parse JSON (application/json content-type)
server.use(body_parser.json());

const port = 4000;

// << db setup >>
const db = require("./db");
const dbName = "testDBname";
const collectionName = "testName";

// << db init >>
db.initialize(
	dbName,
	collectionName,
	function (dbCollection) {
		// successCallback
		// get all events
		dbCollection.find().toArray(function (err, result) {
			if (err) throw err;
			console.log("Connected to db!");
		});

		// << db CRUD routes >>

		// working!
		// add an event
		server.post("/events", (request, response) => {
			const event = request.body;
			dbCollection.insertOne(event, (error, result) => {
				// callback of insertOne
				if (error) throw error;
				// return updated list
				dbCollection.find().toArray((_error, _result) => {
					// callback of find
					if (_error) throw _error;
					response.json(_result);
				});
			});
		});

		// working!
		// filter events
		server.get("/events/filter", (request, response) => {
			const metric = request.body.metric
			const {widget, orgId, type, before, after} = request.body.params
			let findObject = {
				...(metric && {"metric": metric}),
				...(widget && {"params.widget": widget}),
				...(orgId && {"params.orgId": orgId}),
				...(type && {"params.type": type}),
				...(after && {"params.dateTime": {$gt: after}}),
				...(before && {"params.dateTime": {$lt: before}}),
			}

			dbCollection.find(findObject).toArray((error, result) => {
				if (error) throw error;
				response.json(result);
			});
		});

		// not working yet
		// retrieve one event
		server.get("/events/:id", (request, response) => {
			const id = request.params.id;
			console.log(id);
			dbCollection.findOne({ "_id": id }, (error, result) => {
				if (error) throw error;
				// return event
				response.json(result);
			});
		});

	},
	function (err) {
		// failureCallback
		throw err;
	}
);

server.listen(port, () => {
	console.log(`Server listening at ${port}`);
});
