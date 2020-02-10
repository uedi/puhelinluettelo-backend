require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('postdata', function (request, response) {
    if(request.method === 'POST') {
        return JSON.stringify(request.body)
    } else {
        return ' '
    }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postdata'))

app.get('/api/persons', (request, response, next) => {
    Person.find({})
    .then(persons => {
        response.json(persons.map(person => person.toJSON()))
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person.count()
    .then(count => {
        const date = new Date()
        response.send(`<div>
                        <p>Phonebook has info for ${count} people</p>
                        <p>${date}</p>
                    </div>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if(person) {
            response.json(person.toJSON())
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(results => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if(!body.name || !body.number) {
        return response.status(400).json({error: 'name or number missing'})
    } 
    
    const person = new Person({
        name: body.name,
        number: body.number
    })
    
    person.save()
    .then(savedPerson => {
        response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
        response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if(error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({error: 'malformatted id'})
    } else if(error.name === 'ValidationError') {
        return response.status(400).send({error: error.message})
    }
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})