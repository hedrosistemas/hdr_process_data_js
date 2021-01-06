const {writeFile} = require('fs/promises');
const { processHealth, processTemp, processRMMS, processAccRaw, processFFT } = require('hdr-process-data')
const { HDR_H1_ALGORITHMS } = require('./env')

 /**
 * @typedef ExpressRequest
 * @type {object}
 * @property {Array<{type: string, data: Array<{mac: string, rssi: string, raw: string, time: string}>}>} body - Request Body
 * @property {object} headers - Request Headers.
 * @property {object} params - Request Params.
 */
/**
 * POSTBACK CONTROLLER
 * @param {ExpressRequest} req
 * @returns {void}
 */
module.exports = async function postBackController(req,res) {
  const postBackArray = req.body

  const processedMessages = []

  postBackArray.forEach(postBackData=> {
    switch(postBackData.type) {
      case HDR_H1_ALGORITHMS.health:
        processedMessages.push({serviceType: 'HEALTH', ...processHealth(postBackData.data[0].mac, postBackData.data[0].raw, postBackData.data[0].rssi, String(postBackData.data[0].time))})
        break;
      case HDR_H1_ALGORITHMS.temp:
        processedMessages.push({serviceType: 'TEMP', ...processTemp(postBackData.data[0].mac, postBackData.data[0].raw, postBackData.data[0].rssi, String(postBackData.data[0].time))})
        break;
      case HDR_H1_ALGORITHMS.rmms:
        processedMessages.push({serviceType: 'RMMS',...processRMMS(postBackData.data[0].mac, postBackData.data[0].raw, postBackData.data[0].rssi, String(postBackData.data[0].time))})
        break;
      case HDR_H1_ALGORITHMS.fft:
        processedMessages.push({serviceType: 'FFT', ...processFFT(postBackData.data[0].mac, postBackData.data[0].raw, postBackData.data[0].rssi, String(postBackData.data[0].time))})
        break;
      case HDR_H1_ALGORITHMS.accRaw:
        processedMessages.push({serviceType: 'ACC RAW', ...processAccRaw(postBackData.data[0].mac, postBackData.data[0].raw, postBackData.data[0].rssi, String(postBackData.data[0].time))})
        break;
      default:
        break;
    }
  })

  
  await writeFile(`${Date.now()}-failure.json`, JSON.stringify(processedMessages), 'utf8', ()=>{});
  res.status(200).json({})

}