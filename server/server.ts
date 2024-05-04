import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Chat } from './agent'

const fastify = Fastify({
  logger: true
})

fastify.register(cors, {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
})

fastify.post('/api/chat', async (request, _reply) => {
  return Chat(request.body)
})

fastify.listen({ port: 6677 }, (err, _address) => {
  if (err) {
    throw err
  }
})
