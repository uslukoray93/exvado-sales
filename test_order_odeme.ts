import { getTicimaxClient } from './lib/api/ticimax-soap'
import axios from 'axios'
import { parseStringPromise } from 'xml2js'

async function testOdeme() {
  const client = getTicimaxClient() as any

  // Sipariş ID: 1429
  const siparisID = 1429

  console.log(`📞 Sipariş ${siparisID} için ödeme bilgileri sorgulanıyor...`)

  const soapBody = `<tem:SelectSiparisOdeme xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${process.env.NEXT_PUBLIC_BOLBOLBUL_UYEKODU}</tem:UyeKodu>
  <tem:SiparisID>${siparisID}</tem:SiparisID>
</tem:SelectSiparisOdeme>`

  try {
    const result = await client.makeSoapRequest('SelectSiparisOdeme', soapBody)

    console.log('\n📦 SOAP Response:')
    console.log(JSON.stringify(result, null, 2))

    const odemeResult = result?.['s:Envelope']?.['s:Body']?.SelectSiparisOdemeResponse?.SelectSiparisOdemeResult

    if (odemeResult && odemeResult['a:WebSiparisOdeme']) {
      const odemeData = odemeResult['a:WebSiparisOdeme']
      const odemeler = Array.isArray(odemeData) ? odemeData : [odemeData]

      console.log(`\n✅ ${odemeler.length} ödeme kaydı bulundu:`)
      odemeler.forEach((odeme, index) => {
        console.log(`\n  Ödeme ${index + 1}:`)
        console.log(`    - OdemeTipi: ${odeme['a:OdemeTipi']}`)
        console.log(`    - OdemeTipiAdi: ${odeme['a:OdemeTipiAdi']}`)
        console.log(`    - Tutar: ${odeme['a:Tutar']}`)
        console.log(`    - OdemeDurumu: ${odeme['a:OdemeDurumu']}`)
      })
    } else {
      console.log('\n❌ Ödeme bilgisi bulunamadı')
    }

  } catch (error: any) {
    console.error('\n❌ Hata:', error.message)
    if (error.response) {
      console.log('Response data:', error.response.data)
    }
  }
}

testOdeme().catch(console.error)
