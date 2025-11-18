import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tripId = Number(body.tripId);
    const driverId = body.driverId ? Number(body.driverId) : null;
    const unitId = body.unitId ? Number(body.unitId) : null;

    if (!tripId || Number.isNaN(tripId)) {
      return NextResponse.json(
        { ok: false, error: 'tripId is required and must be a number' },
        { status: 400 }
      );
    }

    const pool = await getDb();

    // Update trip with driver and unit, and set status to Assigned
    await pool
      .request()
      .input('TripId', sql.Int, tripId)
      .input('DriverId', sql.Int, driverId)
      .input('UnitId', sql.Int, unitId)
      .input('Status', sql.NVarChar(50), 'Assigned')
      .query(`
        UPDATE dbo.Trips
        SET
          DriverID = @DriverId,
          UnitID = @UnitId,
          Status = @Status
        WHERE TripID = @TripId;
      `);

    return NextResponse.json({
      ok: true,
      tripId,
      driverId,
      unitId,
    });
  } catch (err) {
    console.error('Dispatch assign failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
