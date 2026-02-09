import { z } from "zod";

export const SummaryCardSchema = z.object({
  title: z.string().describe("The title of the summary card"),
  summary: z.string().describe("The main summary text"),
  bullets: z.array(z.string()).optional().describe("Key takeaways or bullet points"),
  tone: z
    .enum(["neutral", "executive", "technical"])
    .optional()
    .describe("The tone of the summary"),
});

export const DataTableSchema = z.object({
  title: z.string().describe("The title of the table"),
  columns: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
      })
    )
    .describe("Column definitions"),
  rows: z
    .string()
    .describe(
      "A JSON string representing the array of row objects. Each object keys should match the column keys."
    ),
  maxRows: z.number().optional().describe("Maximum number of rows to display"),
});

export const GraphSchema = z.object({
  title: z.string().describe("The title of the chart"),
  type: z.enum(["bar", "line", "pie"]).describe("The type of chart to render"),
  data: z
    .array(
      z.object({
        name: z.string(),
        value: z.number(),
      })
    )
    .describe("Data points for the chart"),
  xLabel: z.string().optional().describe("Label for the X axis"),
  yLabel: z.string().optional().describe("Label for the Y axis"),
});
