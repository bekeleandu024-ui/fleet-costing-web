import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDb();

    const result = await pool.request().query(`
      SELECT TOP (200)
        t.TripID,
        t.WeekStart,
        t.Status,
        t.Miles,
        
        d.Name AS DriverName,
        d.Type AS DriverType,
        
        u.UnitNumber,
        
        o.Customer AS CustomerName,
        o.Origin,
        o.Destination,
        
        c.Revenue,
        c.TotalCost,
        c.Profit,
        c.TotalCPM
      FROM dbo.Trips t
      LEFT JOIN dbo.Drivers d ON d.DriverID = t.DriverID
      LEFT JOIN dbo.Units u ON u.UnitID = t.UnitID
      LEFT JOIN dbo.Orders o ON o.OrderID = t.PrimaryOrderID
      OUTER APPLY (
        SELECT TOP (1)
          tc.Revenue,
          tc.TotalCost,
          tc.Profit,
          tc.TotalCPM
        FROM dbo.TripCosts tc
        WHERE tc.TripID = t.TripID
        ORDER BY tc.CreatedAt DESC, tc.CostID DESC
      ) c
      WHERE t.Miles IS NOT NULL
      ORDER BY t.TripID DESC;
    `);

    const trips = result.recordset.map((row: any) => {
      const revenue = Number(row.Revenue ?? 0);
      const profit = Number(row.Profit ?? 0);
      const marginPct = revenue > 0 ? (profit / revenue) * 100 : null;

      return {
        TripID: row.TripID,
        WeekStart: row.WeekStart,
        Status: row.Status,
        Miles: row.Miles,
        DriverName: row.DriverName,
        DriverType: row.DriverType,
        UnitNumber: row.UnitNumber,
        CustomerName: row.CustomerName,
        Origin: row.Origin,
        Destination: row.Destination,
        Revenue: revenue,
        TotalCost: Number(row.TotalCost ?? 0),
        Profit: profit,
        TotalCPM: Number(row.TotalCPM ?? 0),
        MarginPct: marginPct,
      };
    });

    return NextResponse.json({
      ok: true,
      trips,
    });
  } catch (err) {
    console.error('Trip reports query failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
