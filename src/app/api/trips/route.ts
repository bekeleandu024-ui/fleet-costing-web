import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDb();

    const result = await pool.request().query(`
      SELECT TOP (50)
        t.TripID,
        t.RawTripId,
        t.Status             AS TripStatus,
        t.WeekStart,
        t.Miles,
        t.BorderCrossings,
        t.DropHookCount,
        t.PickupCount,
        t.DeliveryCount,
        t.MinimumRevenue,
        t.RequiredRevenue,

        d.DriverID,
        d.Name               AS DriverName,
        d.Type               AS DriverType,

        u.UnitID,
        u.UnitNumber,

        o.OrderID,
        o.Origin,
        o.Destination,
        o.Miles              AS OrderMiles,
        o.Revenue            AS OrderRevenue,
        o.Status             AS OrderStatus,

        c.CustomerID,
        c.CustomerCode,
        c.Name               AS CustomerName,

        cost.CostID,
        cost.TotalCPM,
        cost.TotalCost,
        cost.Revenue         AS CostRevenue,
        cost.Profit,
        cost.IsManual,
        cost.ManualTotalCost,
        cost.ManualReason,
        cost.CreatedAt       AS CostCreatedAt
      FROM dbo.Trips t
      LEFT JOIN dbo.Drivers   d ON d.DriverID   = t.DriverID
      LEFT JOIN dbo.Units     u ON u.UnitID     = t.UnitID
      LEFT JOIN dbo.Orders    o ON o.OrderID    = t.OrderID
      LEFT JOIN dbo.Customers c ON c.CustomerID = o.CustomerID
      OUTER APPLY (
        SELECT TOP (1)
          tc.CostID,
          tc.TotalCPM,
          tc.TotalCost,
          tc.Revenue,
          tc.Profit,
          tc.IsManual,
          tc.ManualTotalCost,
          tc.ManualReason,
          tc.CreatedAt
        FROM dbo.TripCosts tc
        WHERE tc.TripID = t.TripID
        ORDER BY tc.CreatedAt DESC, tc.CostID DESC
      ) AS cost
      WHERE t.Miles IS NOT NULL   -- skip completely-empty test rows
      ORDER BY t.TripID DESC;
    `);

    return NextResponse.json({
      ok: true,
      rowCount: result.recordset.length,
      trips: result.recordset,
    });
  } catch (err) {
    console.error('Trips query failed', err);
    const message =
      err instanceof Error ? err.message : 'Unknown error talking to SQL Server';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
