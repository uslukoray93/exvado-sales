"use client"

import { Line, Bar, Area } from 'recharts'
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  AreaChart as RechartsAreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const data = [
  { name: 'Oca', gelir: 4000, satış: 2400, ziyaretçi: 2400 },
  { name: 'Şub', gelir: 3000, satış: 1398, ziyaretçi: 2210 },
  { name: 'Mar', gelir: 2000, satış: 9800, ziyaretçi: 2290 },
  { name: 'Nis', gelir: 2780, satış: 3908, ziyaretçi: 2000 },
  { name: 'May', gelir: 1890, satış: 4800, ziyaretçi: 2181 },
  { name: 'Haz', gelir: 2390, satış: 3800, ziyaretçi: 2500 },
]

export function LineChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="ziyaretçi" stroke="#8884d8" />
        <Line type="monotone" dataKey="satış" stroke="#82ca9d" />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function BarChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="satış" fill="#8884d8" />
        <Bar dataKey="gelir" fill="#82ca9d" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export function AreaChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsAreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="gelir" stackId="1" stroke="#8884d8" fill="#8884d8" />
        <Area type="monotone" dataKey="satış" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}