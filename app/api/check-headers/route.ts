import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import * as fs from 'fs'

export async function GET() {
  try {
    const results: any = {}

    // Trendyol
    console.log('📂 Reading Trendyol Excel...')
    const trendyolFile = '/Users/korayuslu/Desktop/TY/trendyol-urun.xlsx'
    const trendyolBuffer = fs.readFileSync(trendyolFile)
    const trendyolWorkbook = XLSX.read(trendyolBuffer)
    const trendyolSheet = trendyolWorkbook.Sheets[trendyolWorkbook.SheetNames[0]]
    const trendyolData = XLSX.utils.sheet_to_json(trendyolSheet, { header: 1 }) as any[][]

    results.trendyol = {
      headers: trendyolData[0],
      sampleRow: trendyolData[1],
      totalRows: trendyolData.length - 1
    }

    // N11
    console.log('📂 Reading N11 Excel...')
    const n11File = '/Users/korayuslu/Desktop/TY/n11-urunler.xlsx'
    const n11Buffer = fs.readFileSync(n11File)
    const n11Workbook = XLSX.read(n11Buffer)
    const n11Sheet = n11Workbook.Sheets[n11Workbook.SheetNames[0]]
    const n11Data = XLSX.utils.sheet_to_json(n11Sheet, { header: 1 }) as any[][]

    results.n11 = {
      headers: n11Data[0],
      sampleRow: n11Data[1],
      totalRows: n11Data.length - 1
    }

    // Bolbolbul Excel
    console.log('📂 Reading Bolbolbul Excel...')
    const bolbolbulFile = '/Users/korayuslu/Desktop/TY/bolbolbul-urunler.xls'
    const bolbolbulBuffer = fs.readFileSync(bolbolbulFile)
    const bolbolbulWorkbook = XLSX.read(bolbolbulBuffer)
    const bolbolbulSheet = bolbolbulWorkbook.Sheets[bolbolbulWorkbook.SheetNames[0]]
    const bolbolbulData = XLSX.utils.sheet_to_json(bolbolbulSheet, { header: 1 }) as any[][]

    results.bolbolbul = {
      headers: bolbolbulData[0],
      sampleRow: bolbolbulData[1],
      totalRows: bolbolbulData.length - 1
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error: any) {
    console.error('Error reading files:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
