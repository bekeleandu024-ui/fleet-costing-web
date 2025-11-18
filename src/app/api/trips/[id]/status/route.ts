import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getDb } from '@/lib/db';

type RouteContext = {
  params: { id: string };
};

// PATCH /api/trips/[id]/status - Update trip status
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
    const status = body.status as string;

    if (!status) {
      return NextResponse.json(
        { ok: false, error: 'status is required' },
        { status: 400 }
      );
    }

    const pool = await getDb();

    await pool
      .request()
      .input('TripId', sql.Int, tripId)
      .input('Status', sql.NVarChar(50), status)
      .query(`
        UPDATE dbo.Trips
        SET Status = @Status
        WHERE TripID = @TripId;
      `);

    return NextResponse.json({
      ok: true,
      tripId,
      status,
    });
  } catch (err) {
    console.error('Trip status update failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
