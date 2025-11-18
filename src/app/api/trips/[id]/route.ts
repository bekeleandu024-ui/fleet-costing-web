import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getDb } from '@/lib/db';

type RouteContext = {
  params: { id: string };
};

// GET /api/trips/[id] - Get trip detail
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const tripId = Number(params.id);
    if (!tripId || Number.isNaN(tripId)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    const pool = await getDb();

    // Get trip with related data
    const result = await pool
      .request()
      .input('TripId', sql.Int, tripId)
      .query(`
        SELECT
          t.TripID,
          t.RawTripId,
          t.WeekStart,
          t.Miles,
          t.BorderCrossings,
          t.DropHookCount,
          t.PickupCount,
          t.DeliveryCount,
          t.MinimumRevenue,
          t.RequiredRevenue,
          t.Status,
          t.PrimaryOrderID,

          d.DriverID,
          d.Name AS DriverName,
          d.Type AS DriverType,

          u.UnitID,
          u.UnitNumber,

          o.OrderID,
          o.Customer AS CustomerName,
          o.Origin,
          o.Destination,
          o.Revenue AS OrderRevenue,

          -- Latest trip cost
          c.CostID,
          c.TotalCPM,
          c.TotalCost,
          c.Revenue AS CostRevenue,
          c.Profit,
          c.IsManual,
          c.ManualTotalCost,
          c.ManualReason,
          c.CreatedAt AS CostCreatedAt,
          c.WageMultiplier,
          c.AccessorialCost
        FROM dbo.Trips t
        LEFT JOIN dbo.Drivers d ON d.DriverID = t.DriverID
        LEFT JOIN dbo.Units u ON u.UnitID = t.UnitID
        LEFT JOIN dbo.Orders o ON o.OrderID = t.PrimaryOrderID
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
            tc.CreatedAt,
            tc.WageMultiplier,
            tc.AccessorialCost
          FROM dbo.TripCosts tc
          WHERE tc.TripID = t.TripID
          ORDER BY tc.CreatedAt DESC, tc.CostID DESC
        ) c
        WHERE t.TripID = @TripId;
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Trip not found' },
        { status: 404 }
      );
    }

    const trip = result.recordset[0];

    return NextResponse.json({
      ok: true,
      trip,
    });
  } catch (err) {
    console.error('Trip detail query failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// PATCH /api/trips/[id] - Update trip fields
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const tripId = Number(params.id);
    if (!tripId || Number.isNaN(tripId)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const pool = await getDb();

    // Build dynamic update based on provided fields
    const updates: string[] = [];
    const request = pool.request().input('TripId', sql.Int, tripId);

    if (body.status !== undefined) {
      updates.push('Status = @Status');
      request.input('Status', sql.NVarChar(50), body.status);
    }
    if (body.driverId !== undefined) {
      updates.push('DriverID = @DriverId');
      request.input('DriverId', sql.Int, body.driverId || null);
    }
    if (body.unitId !== undefined) {
      updates.push('UnitID = @UnitId');
      request.input('UnitId', sql.Int, body.unitId || null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    await request.query(`
      UPDATE dbo.Trips
      SET ${updates.join(', ')}
      WHERE TripID = @TripId;
    `);

    return NextResponse.json({
      ok: true,
      tripId,
    });
  } catch (err) {
    console.error('Trip update failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
