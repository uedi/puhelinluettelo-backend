const mongoose = require('mongoose')

if( process.argv.length < 3 ) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0-xiqa3.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

const getPersons = () => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}

const addPerson = (name, number) => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    const person = new Person({
        name: name,
        number: number
    })
    person.save().then(response => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}

if(process.argv.length === 3) {
    getPersons()
} else if(process.argv.length === 5) {
    addPerson(process.argv[3], process.argv[4])
} else {
    console.log('invalid number of arguments')
}
