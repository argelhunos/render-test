require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const Person = require('./models/person')

app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

app.get('/api/persons', (request, response, next) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    const currentDate = (new Date).toString();

    Person
        .find({})
        .then(persons => {
            response.send(`
                <div>Phonebook has info for ${persons.length} people</div>
                <br>
                <div>${currentDate}</div>    
            `)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    // const id = request.params.id;
    // const person = persons.find(person => person.id == id);

    // if (person) {
    //     return response.json(person);
    // } else {
    //     return response.status(404).end();
    // }

    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(request => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const generateId = () => {
    return String(Math.floor(Math.random() * 1000));
}

app.post('/api/persons/', (request, response, next) => {
    const body = request.body

    if (!body.number || !body.name) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    // if (persons.find(person => person.name === body.name)) {
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }

    Person
        .find({name: body.name})
        .then(results => {
            console.log("current length: " + results.length)
            console.log(results[0])
            if (results.length > 0) {
                return response.status(400).json({
                    error: 'name must be unique'
                })
            } else {
                const newPerson = new Person({
                    name: body.name,
                    number: body.number,
                })

                newPerson
                    .save()
                    .then(result => {
                        console.log(`added ${body.name} number ${body.number} to phonebook`)
                        response.json(newPerson)
                    })
                    .catch(error => next(error))
            }
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    if (!body.number || !body.name) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    Person.findById(request.params.id)
        .then(person => {
            if (!person) {
                response.status(404).end()
            } else {
                person.name = body.name
                person.number = body.number

                return person.save().then((updatedPerson) => {
                    response.json(updatedPerson)
                })
            }
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    console.log("entering error handler")

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }

    next(error)
}

// REMEMBER THAT THIS HAS TO BE THE LAST LOADED MIDDLEWARE, AND ALL OF THE ROUTES SHOULD BE REGISTERED BEFORE THIS
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})