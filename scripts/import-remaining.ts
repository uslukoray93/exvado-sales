import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// 51-100 desi arası fiyatlar (devamını da ekleyeceğim)
const MARKUP = 1.2

async function importBatch(start: number, end: number, data: any[]) {
  for (const row of data) {
    await prisma.cargoPrice.upsert({
      where: { desi: row.desi },
      update: {
        aras: row.aras * MARKUP, dhl: row.dhl * MARKUP, kolayGelsin: row.kolayGelsin * MARKUP,
        ptt: row.ptt ? row.ptt * MARKUP : null, surat: row.surat * MARKUP, 
        tex: row.tex ? row.tex * MARKUP : null, yurtici: row.yurtici * MARKUP,
        cevaTedarik: row.cevaTedarik * MARKUP, ceva: row.ceva * MARKUP, horoz: row.horoz * MARKUP,
      },
      create: {
        desi: row.desi, aras: row.aras * MARKUP, dhl: row.dhl * MARKUP, kolayGelsin: row.kolayGelsin * MARKUP,
        ptt: row.ptt ? row.ptt * MARKUP : null, surat: row.surat * MARKUP, 
        tex: row.tex ? row.tex * MARKUP : null, yurtici: row.yurtici * MARKUP,
        cevaTedarik: row.cevaTedarik * MARKUP, ceva: row.ceva * MARKUP, horoz: row.horoz * MARKUP,
      },
    })
  }
  console.log(`✅ ${start}-${end} arası ${data.length} fiyat eklendi`)
}

// 51-100
const batch1 = [
{desi:51,aras:559.36,dhl:1247.78,kolayGelsin:598.99,ptt:988.54,surat:671.93,tex:604.23,yurtici:758.81,cevaTedarik:771.62,ceva:849.57,horoz:635.92},
{desi:52,aras:570.07,dhl:1280.77,kolayGelsin:608.99,ptt:1004.63,surat:684.34,tex:614.68,yurtici:772.40,cevaTedarik:786.75,ceva:858.04,horoz:648.39},
{desi:53,aras:580.77,dhl:1313.76,kolayGelsin:618.99,ptt:1020.70,surat:696.62,tex:625.11,yurtici:785.99,cevaTedarik:801.88,ceva:866.59,horoz:660.86},
{desi:54,aras:591.48,dhl:1346.75,kolayGelsin:628.99,ptt:1036.79,surat:709.03,tex:635.56,yurtici:799.58,cevaTedarik:817.01,ceva:875.27,horoz:673.33},
{desi:55,aras:602.19,dhl:1379.74,kolayGelsin:638.99,ptt:1052.86,surat:721.44,tex:646.01,yurtici:813.18,cevaTedarik:832.14,ceva:883.56,horoz:685.80},
{desi:56,aras:612.89,dhl:1412.73,kolayGelsin:648.99,ptt:1068.95,surat:733.73,tex:656.45,yurtici:826.77,cevaTedarik:847.27,ceva:887.88,horoz:698.27},
{desi:57,aras:623.60,dhl:1445.72,kolayGelsin:658.99,ptt:1085.03,surat:746.13,tex:666.90,yurtici:840.36,cevaTedarik:862.39,ceva:890.66,horoz:710.73},
{desi:58,aras:634.30,dhl:1478.71,kolayGelsin:668.99,ptt:1101.11,surat:758.41,tex:677.32,yurtici:853.95,cevaTedarik:877.52,ceva:893.32,horoz:723.20},
{desi:59,aras:645.01,dhl:1511.70,kolayGelsin:678.99,ptt:1117.19,surat:770.83,tex:687.77,yurtici:867.54,cevaTedarik:892.65,ceva:895.07,horoz:735.67},
{desi:60,aras:655.72,dhl:1544.69,kolayGelsin:688.99,ptt:1133.28,surat:783.23,tex:698.23,yurtici:881.13,cevaTedarik:907.78,ceva:895.48,horoz:748.14},
{desi:61,aras:666.42,dhl:1577.68,kolayGelsin:698.99,ptt:1149.35,surat:795.52,tex:708.66,yurtici:894.72,cevaTedarik:922.91,ceva:896.38,horoz:760.61},
{desi:62,aras:677.13,dhl:1610.67,kolayGelsin:708.99,ptt:1165.44,surat:807.93,tex:719.11,yurtici:908.31,cevaTedarik:938.04,ceva:897.59,horoz:773.08},
{desi:63,aras:687.83,dhl:1643.66,kolayGelsin:718.99,ptt:1181.51,surat:820.21,tex:729.54,yurtici:921.90,cevaTedarik:953.17,ceva:898.81,horoz:785.55},
{desi:64,aras:698.54,dhl:1676.65,kolayGelsin:728.99,ptt:1197.60,surat:832.62,tex:739.99,yurtici:935.50,cevaTedarik:968.30,ceva:901.38,horoz:798.02},
{desi:65,aras:709.24,dhl:1709.64,kolayGelsin:738.99,ptt:1213.67,surat:845.03,tex:750.44,yurtici:949.09,cevaTedarik:983.43,ceva:901.84,horoz:810.49},
{desi:66,aras:719.95,dhl:1742.63,kolayGelsin:748.99,ptt:1229.76,surat:857.31,tex:760.88,yurtici:962.68,cevaTedarik:998.56,ceva:915.69,horoz:822.96},
{desi:67,aras:730.66,dhl:1775.62,kolayGelsin:758.99,ptt:1245.83,surat:869.72,tex:771.33,yurtici:976.27,cevaTedarik:1013.69,ceva:929.58,horoz:835.43},
{desi:68,aras:741.36,dhl:1808.61,kolayGelsin:768.99,ptt:1261.92,surat:882.00,tex:781.75,yurtici:989.86,cevaTedarik:1028.82,ceva:943.43,horoz:847.89},
{desi:69,aras:752.07,dhl:1841.60,kolayGelsin:778.99,ptt:1277.99,surat:894.42,tex:792.20,yurtici:1003.45,cevaTedarik:1043.95,ceva:957.33,horoz:860.36},
{desi:70,aras:762.77,dhl:1874.59,kolayGelsin:788.99,ptt:1294.08,surat:906.82,tex:802.66,yurtici:1017.04,cevaTedarik:1059.08,ceva:971.18,horoz:872.83},
{desi:71,aras:773.48,dhl:1907.58,kolayGelsin:798.99,ptt:1310.16,surat:919.10,tex:813.09,yurtici:1030.63,cevaTedarik:1074.21,ceva:985.07,horoz:885.30},
{desi:72,aras:784.19,dhl:1940.57,kolayGelsin:808.99,ptt:1326.24,surat:931.52,tex:823.54,yurtici:1044.22,cevaTedarik:1089.34,ceva:998.92,horoz:897.77},
{desi:73,aras:794.89,dhl:1973.56,kolayGelsin:818.99,ptt:1342.32,surat:943.80,tex:833.97,yurtici:1057.81,cevaTedarik:1104.47,ceva:1012.81,horoz:910.24},
{desi:74,aras:805.60,dhl:2006.55,kolayGelsin:828.99,ptt:1358.41,surat:956.20,tex:844.42,yurtici:1071.41,cevaTedarik:1119.60,ceva:1026.76,horoz:922.71},
{desi:75,aras:816.30,dhl:2039.54,kolayGelsin:838.99,ptt:1374.48,surat:968.62,tex:854.87,yurtici:1085.00,cevaTedarik:1134.73,ceva:1040.56,horoz:935.18},
{desi:76,aras:827.01,dhl:2072.53,kolayGelsin:848.99,ptt:1390.57,surat:980.90,tex:865.30,yurtici:1098.59,cevaTedarik:1149.86,ceva:1054.50,horoz:947.65},
{desi:77,aras:837.71,dhl:2105.52,kolayGelsin:858.99,ptt:1406.64,surat:993.31,tex:875.76,yurtici:1112.18,cevaTedarik:1164.99,ceva:1068.30,horoz:960.12},
{desi:78,aras:848.42,dhl:2138.51,kolayGelsin:868.99,ptt:1422.73,surat:1005.59,tex:886.18,yurtici:1125.77,cevaTedarik:1180.12,ceva:1082.24,horoz:972.58},
{desi:79,aras:859.13,dhl:2171.50,kolayGelsin:878.99,ptt:1438.80,surat:1018.00,tex:896.63,yurtici:1139.36,cevaTedarik:1195.25,ceva:1096.04,horoz:985.05},
{desi:80,aras:869.83,dhl:2204.49,kolayGelsin:888.99,ptt:1454.89,surat:1030.41,tex:907.09,yurtici:1152.95,cevaTedarik:1210.38,ceva:1109.99,horoz:997.52},
{desi:81,aras:880.54,dhl:2237.48,kolayGelsin:898.99,ptt:1470.96,surat:1042.69,tex:917.52,yurtici:1166.54,cevaTedarik:1225.51,ceva:1123.79,horoz:1009.99},
{desi:82,aras:891.24,dhl:2270.47,kolayGelsin:908.99,ptt:1487.05,surat:1055.11,tex:927.97,yurtici:1180.13,cevaTedarik:1240.64,ceva:1137.73,horoz:1022.46},
{desi:83,aras:901.95,dhl:2303.46,kolayGelsin:918.99,ptt:1503.13,surat:1067.39,tex:938.40,yurtici:1193.73,cevaTedarik:1255.77,ceva:1151.53,horoz:1034.93},
{desi:84,aras:912.65,dhl:2336.45,kolayGelsin:928.99,ptt:1519.21,surat:1079.79,tex:948.85,yurtici:1207.32,cevaTedarik:1270.90,ceva:1165.47,horoz:1047.40},
{desi:85,aras:923.36,dhl:2369.44,kolayGelsin:938.99,ptt:1535.29,surat:1092.21,tex:959.30,yurtici:1220.91,cevaTedarik:1286.03,ceva:1179.27,horoz:1059.87},
{desi:86,aras:934.07,dhl:2402.43,kolayGelsin:948.99,ptt:1551.37,surat:1104.49,tex:969.73,yurtici:1234.50,cevaTedarik:1301.16,ceva:1193.22,horoz:1072.34},
{desi:87,aras:944.77,dhl:2435.42,kolayGelsin:958.99,ptt:1567.45,surat:1116.89,tex:980.18,yurtici:1248.09,cevaTedarik:1302.13,ceva:1207.02,horoz:1084.81},
{desi:88,aras:955.48,dhl:2468.41,kolayGelsin:968.99,ptt:1583.54,surat:1129.18,tex:990.61,yurtici:1261.68,cevaTedarik:1303.23,ceva:1220.96,horoz:1097.28},
{desi:89,aras:966.18,dhl:2501.40,kolayGelsin:978.99,ptt:1599.61,surat:1141.59,tex:1001.06,yurtici:1275.27,cevaTedarik:1304.33,ceva:1234.85,horoz:1109.74},
{desi:90,aras:976.89,dhl:2534.39,kolayGelsin:988.99,ptt:1615.70,surat:1154.00,tex:1011.51,yurtici:1288.86,cevaTedarik:1305.43,ceva:1248.70,horoz:1122.21},
{desi:91,aras:987.60,dhl:2567.38,kolayGelsin:998.99,ptt:1631.77,surat:1166.28,tex:1021.95,yurtici:1302.45,cevaTedarik:1306.54,ceva:1262.60,horoz:1134.68},
{desi:92,aras:998.30,dhl:2600.37,kolayGelsin:1008.99,ptt:1647.86,surat:1178.69,tex:1032.40,yurtici:1316.04,cevaTedarik:1306.54,ceva:1276.44,horoz:1147.15},
{desi:93,aras:1009.01,dhl:2633.36,kolayGelsin:1018.99,ptt:1663.93,surat:1190.98,tex:1042.82,yurtici:1329.64,cevaTedarik:1306.54,ceva:1290.34,horoz:1159.62},
{desi:94,aras:1019.71,dhl:2666.35,kolayGelsin:1028.99,ptt:1680.02,surat:1203.38,tex:1053.28,yurtici:1343.23,cevaTedarik:1306.54,ceva:1304.14,horoz:1172.09},
{desi:95,aras:1030.42,dhl:2699.34,kolayGelsin:1038.99,ptt:1696.09,surat:1215.80,tex:1063.73,yurtici:1356.82,cevaTedarik:1306.54,ceva:1318.08,horoz:1184.56},
{desi:96,aras:1041.12,dhl:2732.33,kolayGelsin:1048.99,ptt:1712.18,surat:1228.08,tex:1074.16,yurtici:1370.41,cevaTedarik:1307.64,ceva:1331.88,horoz:1197.03},
{desi:97,aras:1051.83,dhl:2765.32,kolayGelsin:1058.99,ptt:1728.26,surat:1240.48,tex:1084.61,yurtici:1384.00,cevaTedarik:1308.74,ceva:1345.83,horoz:1209.50},
{desi:98,aras:1062.54,dhl:2798.31,kolayGelsin:1068.99,ptt:1744.34,surat:1252.76,tex:1095.04,yurtici:1397.59,cevaTedarik:1309.84,ceva:1359.63,horoz:1221.97},
{desi:99,aras:1073.24,dhl:2831.30,kolayGelsin:1078.99,ptt:1760.42,surat:1265.18,tex:1105.49,yurtici:1411.18,cevaTedarik:1310.95,ceva:1367.90,horoz:1234.43},
{desi:100,aras:1083.95,dhl:2864.29,kolayGelsin:1088.99,ptt:1776.50,surat:1277.58,tex:1115.94,yurtici:1424.77,cevaTedarik:1312.05,ceva:1369.18,horoz:1246.90}
]

async function main() {
  console.log('🚀 51-100 desi arası import ediliyor...')
  await importBatch(51, 100, batch1)
  console.log('🎉 Tamamlandı!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
