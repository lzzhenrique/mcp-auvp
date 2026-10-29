import { describe, expect, it } from "vitest";
import { analiticaToolDefinitions } from "../src/analitica/tools.js";

const row = (start: string, end: string, value: number) => ({
  start_date: `${start}T03:00:00.000Z`,
  end_date: `${end}T03:00:00.000Z`,
  value: String(value),
  dre: { key: "lucro_liquido", name: "Lucro líquido" },
});

describe("auvp_analitica_get_dres compact view", () => {
  const tool = analiticaToolDefinitions.find((t) => t.name === "auvp_analitica_get_dres")!;
  const payload = [
    row("2025-01-01", "2025-12-31", 100),
    row("2026-07-01", "2026-09-30", 30),
    row("2024-01-01", "2024-12-31", 90),
    row("2026-01-01", "2026-06-30", 50),
    row("2026-01-01", "2026-09-30", 80),
  ];
  const client = { getAnalitica: async () => payload } as never;

  it("returns closed years plus YTD, sorted", async () => {
    const res: any = await (tool as any).handler(client, { asset: "WEGE3", dre: "lucro_liquido" });
    const body = JSON.parse(res.content[0].text);
    expect(body.rows.map((r: any) => [r.end, r.value])).toEqual([
      ["2024-12-31", 90],
      ["2025-12-31", 100],
      ["2026-09-30", 80],
    ]);
  });

  it("quarterly view keeps only 3-month rows", async () => {
    const res: any = await (tool as any).handler(client, { view: "quarterly" });
    const body = JSON.parse(res.content[0].text);
    expect(body.rows).toHaveLength(1);
  });
});
