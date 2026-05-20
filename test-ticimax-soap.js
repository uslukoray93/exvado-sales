// Test Ticimax SelectSiparisUrun directly
const axios = require('axios')
const { parseStringPromise } = require('xml2js')

const wsAuthCode = 'I4PTFT8Q5IW0O7WC5H98R7KZFIXAA2'
const serviceUrl = 'https://www.bolbolbul.com/Servis/SiparisServis.svc'
const orderId = 1471 // Test with latest order

async function testSelectSiparisUrun() {
  try {
    // Test 1: IptalEdilmisUrunler = false
    console.log('\n=== TEST 1: IptalEdilmisUrunler = false ===')
    const soapBody1 = `<tem:SelectSiparisUrun xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${wsAuthCode}</tem:UyeKodu>
  <tem:SiparisID>${orderId}</tem:SiparisID>
  <tem:IptalEdilmisUrunler>false</tem:IptalEdilmisUrunler>
</tem:SelectSiparisUrun>`

    const result1 = await makeSoapRequest('SelectSiparisUrun', soapBody1)
    console.log('Result:', JSON.stringify(result1, null, 2))

    // Test 2: IptalEdilmisUrunler = true
    console.log('\n=== TEST 2: IptalEdilmisUrunler = true ===')
    const soapBody2 = `<tem:SelectSiparisUrun xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${wsAuthCode}</tem:UyeKodu>
  <tem:SiparisID>${orderId}</tem:SiparisID>
  <tem:IptalEdilmisUrunler>true</tem:IptalEdilmisUrunler>
</tem:SelectSiparisUrun>`

    const result2 = await makeSoapRequest('SelectSiparisUrun', soapBody2)
    console.log('Result:', JSON.stringify(result2, null, 2))

    // Test 3: Without IptalEdilmisUrunler
    console.log('\n=== TEST 3: Without IptalEdilmisUrunler parameter ===')
    const soapBody3 = `<tem:SelectSiparisUrun xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${wsAuthCode}</tem:UyeKodu>
  <tem:SiparisID>${orderId}</tem:SiparisID>
</tem:SelectSiparisUrun>`

    const result3 = await makeSoapRequest('SelectSiparisUrun', soapBody3)
    console.log('Result:', JSON.stringify(result3, null, 2))

  } catch (error) {
    console.error('Error:', error.message)
  }
}

async function makeSoapRequest(action, body) {
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`

  console.log('\n📤 SOAP Request:')
  console.log(soapEnvelope)

  const response = await axios.post(serviceUrl, soapEnvelope, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `http://tempuri.org/ISiparisServis/${action}`,
    },
  })

  console.log('\n📥 Raw SOAP Response:')
  console.log(response.data)

  const parsed = await parseStringPromise(response.data, {
    explicitArray: false,
    ignoreAttrs: true,
  })

  return parsed
}

testSelectSiparisUrun()
