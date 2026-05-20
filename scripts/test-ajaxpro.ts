import { config } from 'dotenv'
import axios from 'axios'

config()

async function main() {
  const wsAuthCode = process.env.TICIMAX_WS_AUTH_CODE
  const siparisId = 1481
  const yeniDurum = 4

  console.log(`🔄 Testing AjaxPro SetSiparisDurum...`)
  console.log(`📦 Order ID: ${siparisId}`)
  console.log(`📝 New Status: ${yeniDurum}\n`)

  try {
    const response = await axios.post(
      'https://www.bolbolbul.com/ajaxpro/Admin_SiparisYonetimi,Ticimax.WebApp.ashx',
      JSON.stringify({
        SiparisID: siparisId,
        YeniDurum: yeniDurum,
        isCreateReturnPayment: false
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
          'X-AjaxPro-Method': 'SetSiparisDurum',
          'Authorization': `Bearer ${wsAuthCode}`, // Try auth token
        }
      }
    )

    console.log(`✅ Response:`)
    console.log(JSON.stringify(response.data, null, 2))
  } catch (error: any) {
    console.error(`❌ Error:`, error.response?.data || error.message)
    console.error(`Status: ${error.response?.status}`)
  }
}

main().catch(console.error)
