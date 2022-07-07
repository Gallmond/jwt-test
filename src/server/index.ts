import type { IncomingMessage, ServerResponse } from 'http'
import http from 'http'
import { createJWT, verifyJWT } from '../helpers'

const hostname = '127.0.0.1'
const port = 3000

type HandlesRequest = (req: IncomingMessage, res: ServerResponse) => void
type RouteStore = {[key: string]: HandlesRequest}


const verifyToken: HandlesRequest = (req, res) => {
  if(!req.headers['authorization']){
    res.writeHead(401)
    res.end('Missing authorization header')
    return
  }
  const authHeader = req.headers['authorization']
  const [, token] = authHeader.split(' ')

  const verified = verifyJWT( token )

  if(!verified){
    res.writeHead(401)
    res.end('Invalid token')
    return
  }

  const responseObject = {
    verifiedToken: verified
  }
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(responseObject))
}

const logIn: HandlesRequest = (req, res) => {
  let data = ''
  req.on('data', chunk => {
    data += chunk
  })
  req.on('end', () => {
    const body = JSON.parse(data)
    const {client_id, client_secret} = body

    if(client_id !== process.env.CLIENT_ID || client_secret !== process.env.CLIENT_SECRET) {
      res.writeHead(401)
      res.end('Unauthorized')
      return
    }

    const tokenData = createJWT()
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(tokenData))
  })
}

const routes: RouteStore = {
  '/verifyToken': verifyToken,
  '/login': logIn,
  '/echo': (req, res) => {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      const parsedUrl = new URL(req.url ?? '', `http://${req.headers.host}`)
      const { href,origin,protocol,username,password,host,hostname,port,pathname,search,searchParams } = parsedUrl
      const responseObject = {
        url: {href,origin,protocol,username,password,host,hostname,port,pathname,search,searchParams},
        data: data,
      }
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(responseObject))
    })
  },
  '/hello': (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('hello world')
  }
}


const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  const parsedUrl = new URL(req.url ?? '', `http://${req.headers.host}`)
  const handler = routes[parsedUrl.pathname ?? '/hello'] ?? routes['/hello']
  handler(req, res)
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})

export { hostname, port }

export default server