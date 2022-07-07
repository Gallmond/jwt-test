import http, { RequestOptions } from 'http'
import jwt, { JwtPayload } from 'jsonwebtoken'

type Method = 'POST' | 'GET'
export type SimpleResponse = {
  headers: http.IncomingHttpHeaders,
  data: string,
  status: number|undefined
}

const request = (method: Method, url: string, postBody: object = {}, headers: object = {}): Promise<SimpleResponse> => {
  console.log(`called request(${method}, ${url}, ${JSON.stringify(postBody)})`)
  
  return new Promise((resolve,reject)=>{
    const parsedURL = new URL( url )

    const options: RequestOptions = {
      hostname: parsedURL.hostname,
      port: parsedURL.port ?? 80,
      path: parsedURL.pathname + parsedURL.search,
      method: method,
    }

    if(Object.keys(headers)){
      //@ts-ignore
      options['headers'] = headers
    }

    const req = http.request(options, res => {
      let data = ''
      res.on('data', chunk => {
        data += chunk
      })
      res.on('end', () => {
        const status = res.statusCode
        const message = res.statusMessage
        console.log(`status: ${status} message: ${message}`)

        resolve({data, headers: res.headers, status})
      })
    })
    req.on('error', reject)
    method === 'POST' ? req.write(JSON.stringify(postBody)) : null
    req.end()
  })
}

const verifyJWT = (token: string): false|string|JwtPayload => {
  let verified
  try{
    verified = jwt.verify(token, process.env.JWT_SECRET ?? 'a secret', {
      clockTolerance: 20
    })
  }catch(e){
    console.log('invalid token supplied')
    return false
  }
  return verified
}

const createTwoHourOldJWT = () => {
  const oneHourInSeconds = 60 * 60
  const offset = oneHourInSeconds * 2
  const nowInSeconds = Math.floor(Date.now() / 1000) - offset
  const payload = {
    authorised: true,
    iat: nowInSeconds,                    // issued at
    exp: nowInSeconds + oneHourInSeconds, // expires in one hour
  }
  return {
    token: jwt.sign(payload, process.env.JWT_SECRET ?? 'a secret'),
    expiresIn: oneHourInSeconds,
    expiresAt: payload.exp,
    issuedAt: payload.iat,
  }
}

const createJWT = () => {
  const oneHourInSeconds = 60 * 60
  const nowInSeconds = Math.floor(Date.now() / 1000)
  const payload = {
    authorised: true,
    iat: nowInSeconds,                    // issued at
    exp: nowInSeconds + oneHourInSeconds, // expires in one hour
  }
  return {
    token: jwt.sign(payload, process.env.JWT_SECRET ?? 'a secret'),
    expiresIn: oneHourInSeconds,
    expiresAt: payload.exp,
    issuedAt: payload.iat,
  }
}


export { request, createJWT, verifyJWT, createTwoHourOldJWT }