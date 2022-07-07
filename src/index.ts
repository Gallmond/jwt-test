import server, {hostname, port} from './server'
import { request, createJWT, createTwoHourOldJWT, SimpleResponse } from './helpers'
import dotenv from 'dotenv'
dotenv.config()

setTimeout(() => {
  server.close()
}, 1000)

server.addListener('listening', () => {
  console.log('Server is listening')
  tests()
})
server.addListener('close', () => { console.log('Server is closing') })

const getJson = (res: SimpleResponse) => {
  let body = res.data
  if(res.headers['content-type'] === 'application/json') {
    body = JSON.parse(res.data)
  }
  return body
}
const helloTest = async () => {
  const url = `http://${hostname}:${port}/hello`
  const res = await request('GET', url)
  console.log(`Got response from ${url}`)
  console.log({
    'data': res.data,
    'headers' : res.headers
  })    
  if(res.data !== 'hello world') throw new Error('Unexpected data')
}
const echoTest = async () => {
  const url = `http://${hostname}:${port}/echo`
  const res = await request('GET', url)
  console.log(`Got response from ${url}`)
  console.log({
    'data': res.data,
    'headers' : res.headers
  })
  if(res.headers['content-type'] !== 'application/json') throw new Error('Unexpected header')
}
const postTest = async ()=>{
  const url = `http://${hostname}:${port}/echo`
  const body = {foo: 'bar'}
  const res = await request('POST', url, body)
  console.log(`Got response from ${url}`)
  console.log({
    'data': res.data,
    'headers' : res.headers
  })
  if(JSON.parse(res.data).data !== JSON.stringify(body)) throw new Error('Unexpected data')
}
const getTokenTest = async () => {
  const url = `http://${hostname}:${port}/login`
  const body = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  }
  const res = await request('POST', url, body)
  console.log(`Got response from ${url}`)
  console.log({
    'data': res.data,
    'headers' : res.headers
  })
  return JSON.parse(res.data)
}
const verifyTokenTest = async (token: string) => {
  const url = `http://${hostname}:${port}/verifyToken`
  const res = await request('GET', url, {}, {
    'Authorization': `Bearer ${token}`
  })
  console.log(`Got response from ${url}`)
  console.log({
    'status': res.status,
    'data': res.data,
    'headers' : res.headers
  })
  return res
}

const tests = async () => {
  
  // check the hello world works
  await helloTest()

  // check the echo works
  await echoTest()

  // check a post with a body works
  await postTest()

  // "log in" request a token, using the client_id and client_secret
  const token = await getTokenTest()
  console.log({token})

  // verify the token
  const verifyResponse = await verifyTokenTest(token.token)
  const parsed = JSON.parse(verifyResponse.data)
  if(parsed.verifiedToken.authorised !== true) throw new Error('Token failed')

  /**
   * create a token that is 2 hours old. The tokens are only valid for an hour
   * so this should fail.
   */
  const oldToken = createTwoHourOldJWT()
  const failedVerifyResponse = await verifyTokenTest(oldToken.token)
  if(failedVerifyResponse.status !== 401) throw new Error('Should have failed')


}



