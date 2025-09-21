"use client"

import { TrendingUp } from "lucide-react"
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function GenericPieChart({
  data,
  dataKey = "value",            // default key for numbers
  nameKey = "name",              // default key for labels
  title = "Pie Chart",
  description = "Data distribution",
  colorForItem,                   // function to dynamically assign colors
  fixedColors = [],               // or fixed color array
  emptyMessage = "No data available",
  footerText = "Showing distribution of data",
  footerTrendingText = "Trending up by 3.8% this month",
}) {
  const hasData = Array.isArray(data) && data.some((item) => item[dataKey] > 0)

  // Dynamically build chart config for the ChartContainer
  const chartConfig = data.reduce((acc, item, index) => {
    const color =
      colorForItem?.(item[nameKey], index) || fixedColors[index] || "#9ca3af" // fallback to gray
    acc[item[nameKey]] = {
      label: item[nameKey],
      color,
    }
    return acc
  }, {})

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {/* Chart Content */}
      <CardContent className="flex-1 pb-0">
        {!hasData ? (
          <div className="w-full h-48 flex items-center justify-center text-sm text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px]"
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey={dataKey}
                  nameKey={nameKey}
                  label
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        colorForItem?.(entry[nameKey], index) ||
                        fixedColors[index] ||
                        "#9ca3af"
                      }
                    />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>

      {/* Footer */}
      {hasData && (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            {footerTrendingText} <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">{footerText}</div>
        </CardFooter>
      )}
    </Card>
  )
}
