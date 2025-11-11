const express = require("express");
const app = express();
app.use(express.json());
const morgan = require('morgan');
const cors = require("cors");
app.use(cors());
app.use(express.static("dist"));

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// ===== MIDDLEWARE DE LOG =====
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:", request.path);
  console.log("Body:", request.body);
  console.log("----------------------");
  next();
};

app.use(requestLogger);

// ===== DATOS INICIALES =====
let persons = [
  { id: 1, name: "Arto Hellas", number: "040-123456" },
  { id: 2, name: "Ada Lovelace", number: "39-44-5323523" },
  { id: 3, name: "Dan Abramov", number: "12-43-234345" },
  { id: 4, name: "Mary Poppendieck", number: "39-23-6423122" }
];

// ===== RUTAS PRINCIPALES =====

// Obtener todos - ✅ CORREGIDO: Siempre devuelve array
app.get("/api/persons", (request, response) => {
  response.json(persons); // Esto SIEMPRE es un array
});

// Obtener por id
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(p => p.id === id);
  if (person) response.json(person);
  else response.status(404).end();
});

// Eliminar por id
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(p => p.id !== id);
  response.status(204).end();
});

// Agregar nueva persona
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number missing" });
  }

  const exists = persons.find(
    p => p.name.toLowerCase() === body.name.toLowerCase()
  );

  if (exists) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const newPerson = {
    id: persons.length ? Math.max(...persons.map(p => p.id)) + 1 : 1,
    name: body.name,
    number: body.number
  };

  persons = persons.concat(newPerson);
  response.json(newPerson);
});

// Actualizar persona
app.put("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const { name, number } = request.body;

  const existing = persons.find(p => p.id === id);
  if (!existing) return response.status(404).json({ error: "not found" });

  const updated = { ...existing, name, number };
  persons = persons.map(p => (p.id !== id ? p : updated));

  response.json(updated);
});

// ===== RUTA PARA SERVIR EL FRONTEND =====
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

// ===== RUTA DESCONOCIDA =====
const badPath = (request, response) => {
  response.status(404).send({ error: "Ruta desconocida" });
};

app.use(badPath);

// ===== INICIO DEL SERVIDOR =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});