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
        
        d.Name AS DriverName,
        u.UnitNumber,
        
        o.Customer AS CustomerName,
        o.Origin,
        o.Destination,
        
        c.Revenue,
        
        -- Last event
        e.EventType AS LastEventType,
        e.EventTime AS LastEventTime
      FROM dbo.Trips t
      LEFT JOIN dbo.Drivers d ON d.DriverID = t.DriverID
      LEFT JOIN dbo.Units u ON u.UnitID = t.UnitID
      LEFT JOIN dbo.Orders o ON o.OrderID = t.PrimaryOrderID
      OUTER APPLY (
        SELECT TOP (1) tc.Revenue
        FROM dbo.TripCosts tc
        WHERE tc.TripID = t.TripID
        ORDER BY tc.CreatedAt DESC, tc.CostID DESC
      ) c
      OUTER APPLY (
        SELECT TOP (1) te.EventType, te.EventTime
        FROM dbo.TripEvents te
        WHERE te.TripID = t.TripID
        ORDER BY te.EventTime DESC, te.TripEventID DESC
      ) e
      WHERE t.Miles IS NOT NULL
        AND t.Status NOT IN ('Completed', 'Cancelled')
      ORDER BY t.TripID DESC;
    `);

    return NextResponse.json({
      ok: true,
      trips: result.recordset,
    });
  } catch (err) {
    console.error('Tracking query failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
