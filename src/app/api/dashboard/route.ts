import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await getDb();

    const result = await pool.request().query(`
      ;WITH LatestCost AS (
        SELECT
          tc.TripID,
          tc.Revenue,
          tc.TotalCost,
          tc.Profit,
          ROW_NUMBER() OVER (
            PARTITION BY tc.TripID
            ORDER BY tc.CreatedAt DESC, tc.CostID DESC
          ) AS rn
        FROM dbo.TripCosts tc
      )
      SELECT
        TotalTrips         = COUNT(DISTINCT t.TripID),
        TripsWithCost      = COUNT(DISTINCT CASE WHEN lc.rn = 1 THEN t.TripID END),
        TotalMiles         = SUM(CAST(t.Miles AS BIGINT)),
        TotalRequiredRev   = SUM(CAST(t.RequiredRevenue AS DECIMAL(18,2))),
        TotalMinRev        = SUM(CAST(t.MinimumRevenue AS DECIMAL(18,2))),
        TotalRevenue       = SUM(CASE WHEN lc.rn = 1 THEN CAST(lc.Revenue AS DECIMAL(18,2)) ELSE 0 END),
        TotalCost          = SUM(CASE WHEN lc.rn = 1 THEN CAST(lc.TotalCost AS DECIMAL(18,2)) ELSE 0 END),
        TotalProfit        = SUM(CASE WHEN lc.rn = 1 THEN CAST(lc.Profit AS DECIMAL(18,2)) ELSE 0 END),
        ProfitableTrips    = COUNT(DISTINCT CASE WHEN lc.rn = 1 AND lc.Profit > 0 THEN t.TripID END),
        AtRiskTrips        = COUNT(DISTINCT CASE WHEN lc.rn = 1 AND lc.Profit <= 0 THEN t.TripID END)
      FROM dbo.Trips t
      LEFT JOIN LatestCost lc
        ON lc.TripID = t.TripID
       AND lc.rn = 1
      WHERE t.Miles IS NOT NULL;   -- ignore test rows
    `);

    const row = result.recordset[0] || {};
    const totalMiles = Number(row.TotalMiles ?? 0);
    const totalRevenue = Number(row.TotalRevenue ?? 0);
    const totalCost = Number(row.TotalCost ?? 0);
    const totalProfit = Number(row.TotalProfit ?? 0);

    const rpm = totalMiles > 0 ? totalRevenue / totalMiles : 0;
    const cpm = totalMiles > 0 ? totalCost / totalMiles : 0;
    const marginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      ok: true,
      metrics: {
        totalTrips: row.TotalTrips ?? 0,
        tripsWithCost: row.TripsWithCost ?? 0,
        totalMiles,
        totalRequiredRev: Number(row.TotalRequiredRev ?? 0),
        totalMinRev: Number(row.TotalMinRev ?? 0),
        totalRevenue,
        totalCost,
        totalProfit,
        rpm,
        cpm,
        marginPct,
        profitableTrips: row.ProfitableTrips ?? 0,
        atRiskTrips: row.AtRiskTrips ?? 0,
      },
    });
  } catch (err) {
    console.error('Dashboard query failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
