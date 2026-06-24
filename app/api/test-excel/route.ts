import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import * as fs from 'fs'

export async function GET() {
  try {
    const results: any = {}

    // Trendyol
    const trendyolFile = '/Users/korayuslu/Desktop/TY/trendyol-urun.xlsx'
    const trendyolBuffer = fs.readFileSync(trendyolFile)
    const trendyolWorkbook = XLSX.read(trendyolBuffer)
    const trendyolSheet = trendyolWorkbook.Sheets[trendyolWorkbook.SheetNames[0]]
    const trendyolData = XLSX.utils.sheet_to_json(trendyolSheet, { header: 1 }) as any[][]

    results.trendyol = {
      headers: trendyolData[0],
      firstRow: trendyolData[1],
      totalRows: trendyolData.length
    }

    // N11
    const n11File = '/Users/korayuslu/Desktop/TY/n11-urunler.xlsx'
    const n11Buffer = fs.readFileSync(n11File)
    const n11Workbook = XLSX.read(n11Buffer)
    const n11Sheet = n11Workbook.Sheets[n11Workbook.SheetNames[0]]
    const n11Data = XLSX.utils.sheet_to_json(n11Sheet, { header: 1 }) as any[][]

    results.n11 = {
      headers: n11Data[0],
      firstRow: n11Data[1],
      totalRows: n11Data.length
    }

    // Bolbolbul
    const bolbolbulFile = '/Users/korayuslu/Desktop/TY/bolbolbul-urunler.xls'
    const bolbolbulBuffer = fs.readFileSync(bolbolbulFile)
    const bolbolbulWorkbook = XLSX.read(bolbolbulBuffer)
    const bolbolbulSheet = bolbolbulWorkbook.Sheets[bolbolbulWorkbook.SheetNames[0]]
    const bolbolbulData = XLSX.utils.sheet_to_json(bolbolbulSheet, { header: 1 }) as any[][]

    results.bolbolbul = {
      headers: bolbolbulData[0],
      firstRow: bolbolbulData[1],
      totalRows: bolbolbulData.length
    }

    // XML
    const xmlResponse = await fetch('https://panel.bolbolbul.com/tum_urunler.xml')
    const xmlText = await xmlResponse.text()

    // Parse first item from XML
    const parser = new (require('xmldom').DOMParser)()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    const items = xmlDoc.getElementsByTagName('item')

    if (items.length > 0) {
      const firstItem = items[0]
      const xmlSample: any = {}

      // Get all child elements
      for (let i = 0; i < firstItem.childNodes.length; i++) {
        const node = firstItem.childNodes[i]
        if (node.nodeType === 1) { // Element node
          xmlSample[node.nodeName] = node.textContent
        }
      }

      results.xml = {
        totalItems: items.length,
        sampleItem: xmlSample
      }
    }

    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
