import * as Keyv from 'keyv'
import * as isIp from 'is-ip'
import * as moment from 'moment'

import { send } from 'micro'

const keyv = new Keyv()
const log = str => console.log('[' + moment().format() + '] ' + str)

const getTTL = () => {
  const now = moment()
  const endOfDay = moment().endOf('day')
  return endOfDay.diff(now, 'millisecond')
}

module.exports = async (req, res) => {
  if (req.url.length > 0 && req.url.split('/').slice(1).length === 1 && isIp(req.url.split('/').slice(1)[0])) {
    const ip = req.url.split('/').slice(1)[0]
    let counter = await keyv.get(ip)
    log(`Counter for ip: ${ip} was ${counter}`)
    const TTL = getTTL()
    if (counter) {
      await keyv.set(ip, ++counter, TTL)
    } else {
      counter = 1
      await keyv.set(ip, counter, TTL)
    }
    log(`Set for ip ${ip} counter: ${counter} with TTL ${TTL}`)
    send(res, 200, {
      error: 0,
      counter: counter
    })
  } else {
    console.log('wrong parameters')
    send(res, 400, {
      error: 1,
      message: 'Unexpected error'
    })
  }
}
