// importing
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'

// app config
const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
  appId: '1255862',
  key: '7e91f487c98d5127888a',
  secret: '4690f383e4b3fa7b98e0',
  cluster: 'ap1',
  useTLS: true,
})

const db = mongoose.connection

db.once('open', () => {
  console.log('DB is connected')

  const msgCollection = db.collection('messagecontents')
  const changeStream = msgCollection.watch()

  changeStream.on('change', (change) => {
    console.log(change)

    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument
      pusher.trigger('messages', 'inserted', {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
      })
    } else {
      console.log('Error triggering Pusher')
    }
  })
})

// middlewares
app.use(express.json())
app.use(cors())

// CORS
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader('Access-Control-Allow-Headers', '*')
//   next()
// })

// DB config
const connection_url =
  'mongodb+srv://admin:T0VCDbvxVOi5GMPT@cluster0.1jofy.mongodb.net/whatsappdb?retryWrites=true&w=majority'

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// ?????

// api route
app.get('/', (req, res) => {
  res.status(200).send('Hello World')
})

app.get('/messages/sync', (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(200).send(data)
    }
  })
})

app.post('/messages/new', (req, res) => {
  const dbMessage = req.body

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(201).send(`new message created: \n ${data}`)
    }
  })
})

// listener
app.listen(port, () => {
  console.log(`Listening on localhost:${port}`)
})

// mongodb+srv://admin:T0VCDbvxVOi5GMPT@cluster0.1jofy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
