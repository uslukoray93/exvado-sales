// Test if SelectSiparis includes products when UrunGetir=true
const axios = require('axios')
const { parseStringPromise } = require('xml2js')

const wsAuthCode = 'I4PTFT8Q5IW0O7WC5H98R7KZFIXAA2'
const serviceUrl = 'https://www.bolbolbul.com/Servis/SiparisServis.svc'

async function testSelectSiparis() {
  try {
    const end = new Date()
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

    // SelectSiparis with UrunGetir=true
    const soapBody = `<tem:SelectSiparis xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${wsAuthCode}</tem:UyeKodu>
  <tem:f>
    <a:EntegrasyonAktarildi xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:EntegrasyonAktarildi>
    <a:IptalEdilmisUrunler xmlns:a="http://schemas.datacontract.org/2004/07/">true</a:IptalEdilmisUrunler>
    <a:OdemeDurumu xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:OdemeDurumu>
    <a:OdemeTipi xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:OdemeTipi>
    <a:SiparisDurumu xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:SiparisDurumu>
    <a:SiparisID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:SiparisID>
    <a:SiparisTarihiBas xmlns:a="http://schemas.datacontract.org/2004/07/">${start.toISOString()}</a:SiparisTarihiBas>
    <a:SiparisTarihiSon xmlns:a="http://schemas.datacontract.org/2004/07/">${end.toISOString()}</a:SiparisTarihiSon>
    <a:TedarikciID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:TedarikciID>
    <a:UyeID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:UyeID>
    <a:UrunGetir xmlns:a="http://schemas.datacontract.org/2004/07/">true</a:UrunGetir>
  </tem:f>
  <tem:s>
    <a:BaslangicIndex xmlns:a="http://schemas.datacontract.org/2004/07/">0</a:BaslangicIndex>
    <a:KayitSayisi xmlns:a="http://schemas.datacontract.org/2004/07/">1</a:KayitSayisi>
    <a:SiralamaDegeri xmlns:a="http://schemas.datacontract.org/2004/07/">ID</a:SiralamaDegeri>
    <a:SiralamaYonu xmlns:a="http://schemas.datacontract.org/2004/07/">DESC</a:SiralamaYonu>
  </tem:s>
</tem:SelectSiparis>`

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    ${soapBody}
  </soap:Body>
</soap:Envelope>`

    const response = await axios.post(serviceUrl, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/ISiparisServis/SelectSiparis',
      },
    })

    console.log('📥 Raw SOAP Response (First 5000 chars):')
    console.log(response.data.substring(0, 5000))

    const parsed = await parseStringPromise(response.data, {
      explicitArray: false,
      ignoreAttrs: true,
    })

    console.log('\n\n📊 Parsed Response:')
    console.log(JSON.stringify(parsed, null, 2))

    // Check if products are included
    const webSiparis = parsed?.['s:Envelope']?.['s:Body']?.SelectSiparisResponse?.SelectSiparisResult?.['a:WebSiparis']

    if (webSiparis) {
      const siparis = Array.isArray(webSiparis) ? webSiparis[0] : webSiparis
      console.log('\n\n🔍 Checking for products in response:')
      console.log('Has a:WebSiparisUrun?', !!siparis['a:WebSiparisUrun'])
      console.log('Has a:SiparisUrunler?', !!siparis['a:SiparisUrunler'])
      console.log('Has a:Urunler?', !!siparis['a:Urunler'])
      console.log('Has products?', !!siparis['products'])

      console.log('\n\n📦 All keys in siparis object:')
      console.log(Object.keys(siparis).filter(k => k.startsWith('a:')))
    }

  } catch (error) {
    console.error('Error:', error.message)
  }
}

testSelectSiparis()
