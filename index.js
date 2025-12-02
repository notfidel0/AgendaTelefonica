require('dotenv').config() 
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require('morgan');
const Person = require('./models/person') 

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons);
    })
    .catch(error => next(error))
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error))
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error))
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number missing" });
  }



  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({ error: "name must be unique" });
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person.save()
        .then(savedPerson => {
          response.json(savedPerson);
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  const person = {
    name,
    number,
  }

  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' } 
  )
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
});


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Ruta desconocida" });
};

app.use(unknownEndpoint);

// ⬇️ MANEJADOR DE ERRORES CORREGIDO PARA MOSTRAR CLARIDAD Y ENVIAR 500
const errorHandler = (error, request, response, next) => {
  console.error("--- ERROR DETECTADO EN EL BACKEND ---");
  console.error(error.message);
  console.error(`Nombre del Error: ${error.name}`); 
  console.error("--------------------------------------");

  // Manejo de errores de ID (CastError)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  
  // Manejo de errores de Validación de Mongoose
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  // Para cualquier otro error (incluyendo errores de referencia o de lógica en el GET),
  // enviamos un 500 y usamos el mensaje para el diagnóstico.
  return response.status(500).json({ error: error.message || 'Internal server error' })
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});