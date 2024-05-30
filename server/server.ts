import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Chat } from './chat'
import type { ChatBody } from './types'

const fastify = Fastify({ logger: true })

fastify.register(cors, { methods: 'GET,POST' })

fastify.post('/api/chat', async (request, reply) => {
  try {
    const response = await Chat(request.body as ChatBody)
    return reply.status(200).send(response)
  } catch (err) {
    fastify.log.error(err)
    throw err
  }
})

fastify.setErrorHandler((error, _request, reply) => {
  reply.status(error.statusCode || 500).send({ error: error.message })
})

fastify.listen({ port: 6677 }, err => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
