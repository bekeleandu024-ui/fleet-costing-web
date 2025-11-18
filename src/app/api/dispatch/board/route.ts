import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDb();

    const result = await pool.request().query(`
      SELECT
        t.TripID,
        t.Status,
        t.Miles,
        
        d.DriverID,
        d.Name AS DriverName,
        d.Type AS DriverType,
        
        u.UnitID,
        u.UnitNumber,
        
        o.OrderID,
        o.Customer AS CustomerName,
        o.Origin,
        o.Destination,
        
        c.Revenue,
        c.TotalCost,
        c.Profit
      FROM dbo.Trips t
      LEFT JOIN dbo.Drivers d ON d.DriverID = t.DriverID
      LEFT JOIN dbo.Units u ON u.UnitID = t.UnitID
      LEFT JOIN dbo.Orders o ON o.OrderID = t.PrimaryOrderID
      OUTER APPLY (
        SELECT TOP (1)
          tc.Revenue,
          tc.TotalCost,
          tc.Profit
        FROM dbo.TripCosts tc
        WHERE tc.TripID = t.TripID
        ORDER BY tc.CreatedAt DESC, tc.CostID DESC
      ) c
      WHERE t.Miles IS NOT NULL
        AND t.Status NOT IN ('Cancelled')
      ORDER BY t.TripID DESC;
    `);

    const trips = result.recordset.map((row: any) => {
      const marginPct =
        row.Revenue && row.Revenue > 0
          ? ((row.Profit ?? 0) / row.Revenue) * 100
          : null;

      return {
        TripID: row.TripID,
        Status: row.Status ?? 'Unassigned',
        DriverID: row.DriverID,
        DriverName: row.DriverName,
        DriverType: row.DriverType,
        UnitID: row.UnitID,
        UnitNumber: row.UnitNumber,
        CustomerName: row.CustomerName,
        Origin: row.Origin,
        Destination: row.Destination,
        Miles: row.Miles,
        Revenue: row.Revenue,
        TotalCost: row.TotalCost,
        Profit: row.Profit,
        MarginPct: marginPct,
      };
    });

    return NextResponse.json({
      ok: true,
      trips,
    });
  } catch (err) {
    console.error('Dispatch board query failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
