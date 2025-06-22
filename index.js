const express = require('express')
const cors = require('cors')
const app = express()

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

// without thi json parser middleware, body property would be undefined
app.use(express.json())

app.use(cors())

// make express show static content
app.use(express.static('dist'))


// request => contains all of the information of the HTTP request
// response => used to define how the request is responded to
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>');
})

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = notes.find (note => note.id === id)
    
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter (note => note.id !== id)

    response.status(204).end()
})

app.put('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const body = request.body

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    notes = notes.map(note => note.id === id ? body : note)

    response.json(body)
})

const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => Number(n.id)))
        : 0
    return String(maxId + 1)
}

app.post('/api/notes', (request, response) => {
    const body = request.body
    
    if (!body.content) {
        // calling return is crucial, because it would just save the malformed note
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content,
        important: body.important || false,
        id: generateId()
    }

    notes = notes.concat(note)

    response.json(note)
})

// bind the server assigned to app variable to port 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})