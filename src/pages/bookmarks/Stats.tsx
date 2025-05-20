import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { BookMark } from "@/types"
import { useBookMarks } from "@/context/BookMarkProvider"

const chartConfig = {
  views: {
    label: "Bookmarks",
  },
  count: {
    label: "Repos BookMarked",
    color: "var( --color-chart-1)",
  },
} satisfies ChartConfig

function groupByDate(bookmarks: BookMark[]): { date: string; count: number }[] {
  const counts: Record<string, number> = {};

  for (const bm of bookmarks) {
    const date = bm.bookmarked_at.slice(0, 10);
    counts[date] = (counts[date] || 0) + 1;
  }

  const value = Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  console.log(value);
  return value
}

export function Stats() {
 const {bookMarks} = useBookMarks();

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>
            Showing number of repositories bookmarked by date
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={groupByDate(bookMarks)}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={"count"} fill={`var(--color-count)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
