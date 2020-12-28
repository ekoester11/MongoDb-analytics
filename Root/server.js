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
		// get all items
		dbCollection.find().toArray(function (err, result) {
			if (err) throw err;
			console.log(result);
		});

		// << db CRUD routes >>

		// IMPORTANT
		// add an item
		// this one is not working- test with:
		// curl -H "Content-Type: application/json" -X POST -d '{"Widget":"test","Metric":"test2", "Params": {"i": 2, "a": "hi"}}' http://localhost:4000/items
		// returns syntax error and not sure where it's coming from.
		// simple test is curl -X POST http://localhost:4000/items and succesfully puts an empy object in db
		server.post("/items", (request, response) => {
			const item = request.body;
			dbCollection.insertOne(item, (error, result) => {
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

		// IMPORTANT
		// get items
		server.get("/items", (request, response) => {
			// return updated list
			dbCollection.find().toArray((error, result) => {
				if (error) throw error;
				response.json(result);
			});
		});

		// retrieve one item
		server.get("/items/Widget", (request, response) => {
			const w = request.params.Widget;
			dbCollection.findOne({ Widget: w }, (error, result) => {
				if (error) throw error;
				// return item
				response.json(result);
			});
		});

		// update an item
		server.put("/items/:id", (request, response) => {
			const itemId = request.params.id;
			const item = request.body;
			console.log("Editing item: ", itemId, " to be ", item);

			dbCollection.updateOne(
				{ id: itemId },
				{ $set: item },
				(error, result) => {
					if (error) throw error;
					// send back entire updated list, to make sure frontend data is up-to-date
					dbCollection.find().toArray(function (_error, _result) {
						if (_error) throw _error;
						response.json(_result);
					});
				}
			);
		});

		// delete an item
		server.delete("/items/:id", (request, response) => {
			const itemId = request.params.id;
			console.log("Delete item with id: ", itemId);

			dbCollection.deleteOne({ id: itemId }, function (error, result) {
				if (error) throw error;
				// send back entire updated list after successful request
				dbCollection.find().toArray(function (_error, _result) {
					if (_error) throw _error;
					response.json(_result);
				});
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
