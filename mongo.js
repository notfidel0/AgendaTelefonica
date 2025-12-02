const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Te faltan parametros');
    console.log('Para agregar: node mongo.js <password> [nombre]] [numero]');
    console.log('Para visualizar todos: node mongo.js <password>');
    
    process.exit(1)
}

const password = process.argv[2]


const url = `mongodb+srv://fidel:${password}@cluster0.gupnpme.mongodb.net/?appName=agenda`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  console.log('Agenda Telefonica:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}

else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(result => {
    console.log('Agregado correctamente')
    mongoose.connection.close()
  })
}

else {
  console.log('Error en los parámetros.')
  console.log('Para listar: node mongo.js <password>')
  console.log('Para agregar: node mongo.js <password> <nombre> <numero>')
  mongoose.connection.close()
}