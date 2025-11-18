import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDb();

    // Aggregates by driver type
    const driverTypeResult = await pool.request().query(`
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
        d.Type AS DriverType,
        Trips = COUNT(DISTINCT t.TripID),
        Miles = SUM(CAST(t.Miles AS BIGINT)),
        Revenue = SUM(CASE WHEN lc.rn = 1 THEN CAST(lc.Revenue AS DECIMAL(18,2)) ELSE 0 END),
        Cost = SUM(CASE WHEN lc.rn = 1 THEN CAST(lc.TotalCost AS DECIMAL(18,2)) ELSE 0 END),
        Profit = SUM(CASE WHEN lc.rn = 1 THEN CAST(lc.Profit AS DECIMAL(18,2)) ELSE 0 END)
      FROM dbo.Trips t
      LEFT JOIN dbo.Drivers d ON d.DriverID = t.DriverID
      LEFT JOIN LatestCost lc ON lc.TripID = t.TripID AND lc.rn = 1
      WHERE t.Miles IS NOT NULL
        AND d.Type IS NOT NULL
      GROUP BY d.Type
      ORDER BY Revenue DESC;
    `);

    // Aggregates by customer
    const customerResult = await pool.request().query(`
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
      SELECT TOP (20)
        o.Customer AS CustomerName,
        Trips = COUNT(DISTINCT t.TripID),
        Miles = SUM(CAST(t.Miles AS BIGINT)),
        Revenue = SUM(CASE WHEN lc.rn = 1 THEN CAST(lc.Revenue AS DECIMAL(18,2)) ELSE 0 END),
        Cost = SUM(CASE WHEN lc.rn = 1 THEN CAST(lc.TotalCost AS DECIMAL(18,2)) ELSE 0 END),
        Profit = SUM(CASE WHEN lc.rn = 1 THEN CAST(lc.Profit AS DECIMAL(18,2)) ELSE 0 END)
      FROM dbo.Trips t
      LEFT JOIN dbo.Orders o ON o.OrderID = t.PrimaryOrderID
      LEFT JOIN LatestCost lc ON lc.TripID = t.TripID AND lc.rn = 1
      WHERE t.Miles IS NOT NULL
        AND o.Customer IS NOT NULL
      GROUP BY o.Customer
      ORDER BY Revenue DESC;
    `);

    const aggregatesByDriverType = driverTypeResult.recordset.map((row: any) => {
      const revenue = Number(row.Revenue ?? 0);
      const profit = Number(row.Profit ?? 0);
      const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        DriverType: row.DriverType,
        Trips: row.Trips,
        Miles: row.Miles,
        Revenue: revenue,
        Cost: Number(row.Cost ?? 0),
        Profit: profit,
        MarginPct: marginPct,
      };
    });

    const aggregatesByCustomer = customerResult.recordset.map((row: any) => {
      const revenue = Number(row.Revenue ?? 0);
      const profit = Number(row.Profit ?? 0);
      const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        CustomerName: row.CustomerName,
        Trips: row.Trips,
        Miles: row.Miles,
        Revenue: revenue,
        Cost: Number(row.Cost ?? 0),
        Profit: profit,
        MarginPct: marginPct,
      };
    });

    return NextResponse.json({
      ok: true,
      aggregatesByDriverType,
      aggregatesByCustomer,
    });
  } catch (err) {
    console.error('Stats costing query failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
