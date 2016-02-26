var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

// GET /todos?completed=true&q=house
app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(todos, {completed: true});
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(todos, {completed: false});
    }

    // q need to be there and it needs to be > 0
    // we'll need to use the underscore collections filter method
    // for the filter criteria, use indexOf('sometext'). if
    // you get something other than -1, the text is in the string
    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function (obj) {
            return obj.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) != -1;
        });
    }

    res.json(filteredTodos);
});

app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var match = _.findWhere(todos, {id: todoId});

    if (match) {
        res.json(match);
    } else {
        res.status(404).send();
    }

});

// POST /todos but data in JSON/string form is sent
app.post('/todos', function (req, res) {
    // var body = req.body;
    var body = _.pick(req.body, 'description', 'completed');

    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send();
    }

    body.description = body.description.trim();

    body.id = todoNextId;
    todos.push(body);
    todoNextId++;

    res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var match = _.findWhere(todos, {id: todoId});

    if (match) {
        todos = _.without(todos, match);
        res.json(match);
    } else {
        res.status(404).json({"error": "no todo with id" + todoId});
    }
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var match = _.findWhere(todos, {id: todoId});
    if (!match) {
        return res.status(404).send();
    }

    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    // body.hasOwnProperty('completed')
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(match, validAttributes);
    res.json(match);

});

app.listen(PORT, function () {
    console.log("Express listening on PORT " + PORT);
});