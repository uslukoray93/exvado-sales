import { getTicimaxClient } from './lib/api/ticimax-soap'

async function testById() {
  const client = getTicimaxClient() as any
  console.log('Sipariş ID 1429 sorgulanıyor...')

  // Make SOAP request directly with SiparisID=1429
  const soapBody = `<tem:SelectSiparis xmlns:tem="http://tempuri.org/">
  <tem:UyeKodu>${process.env.NEXT_PUBLIC_BOLBOLBUL_UYEKODU}</tem:UyeKodu>
  <tem:f>
    <a:EntegrasyonAktarildi xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:EntegrasyonAktarildi>
    <a:IptalEdilmisUrunler xmlns:a="http://schemas.datacontract.org/2004/07/">true</a:IptalEdilmisUrunler>
    <a:OdemeDurumu xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:OdemeDurumu>
    <a:OdemeTipi xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:OdemeTipi>
    <a:SiparisDurumu xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:SiparisDurumu>
    <a:SiparisID xmlns:a="http://schemas.datacontract.org/2004/07/">1429</a:SiparisID>
    <a:SiparisTarihiBas xmlns:a="http://schemas.datacontract.org/2004/07/">2026-01-01T00:00:00Z</a:SiparisTarihiBas>
    <a:SiparisTarihiSon xmlns:a="http://schemas.datacontract.org/2004/07/">2026-12-31T23:59:59Z</a:SiparisTarihiSon>
    <a:TedarikciID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:TedarikciID>
    <a:UyeID xmlns:a="http://schemas.datacontract.org/2004/07/">-1</a:UyeID>
    <a:UrunGetir xmlns:a="http://schemas.datacontract.org/2004/07/">true</a:UrunGetir>
  </tem:f>
  <tem:s>
    <a:BaslangicIndex xmlns:a="http://schemas.datacontract.org/2004/07/">0</a:BaslangicIndex>
    <a:KayitSayisi xmlns:a="http://schemas.datacontract.org/2004/07/">10</a:KayitSayisi>
    <a:SiralamaDegeri xmlns:a="http://schemas.datacontract.org/2004/07/">ID</a:SiralamaDegeri>
    <a:SiralamaYonu xmlns:a="http://schemas.datacontract.org/2004/07/">DESC</a:SiralamaYonu>
  </tem:s>
</tem:SelectSiparis>`

  try {
    const result = await client.makeSoapRequest('SelectSiparis', soapBody)

    const siparisResult =
      result?.['s:Envelope']?.['s:Body']?.SelectSiparisResponse?.SelectSiparisResult

    if (!siparisResult || !siparisResult['a:WebSiparis']) {
      console.log('❌ Sipariş bulunamadı!')
      return
    }

    const webSiparisData = siparisResult['a:WebSiparis']
    const order = Array.isArray(webSiparisData) ? webSiparisData[0] : webSiparisData

    console.log('\n=== SONUÇ ===')
    console.log('Sipariş ID:', order['a:ID'])
    console.log('Sipariş No:', order['a:SiparisNo'])
    console.log('OdemeTipi:', order['a:OdemeTipi'])
    console.log('OdemeTipiAdi:', order['a:OdemeTipiAdi'])
    console.log('OdemeDurumu:', order['a:OdemeDurumu'])
    console.log('OdemeDurumuAdi:', order['a:OdemeDurumuAdi'])
    console.log('=============\n')
  } catch (error: any) {
    console.error('❌ Hata:', error.message)
  }
}

testById().catch(console.error)
