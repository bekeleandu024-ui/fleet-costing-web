import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getDb } from '@/lib/db';

type RouteContext = {
  params: { id: string };
};

// GET /api/trips/[id]/events - Get trip events
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

    const result = await pool
      .request()
      .input('TripId', sql.Int, tripId)
      .query(`
        SELECT
          TripEventID,
          TripID,
          EventType,
          EventTime,
          City,
          State,
          Note
        FROM dbo.TripEvents
        WHERE TripID = @TripId
        ORDER BY EventTime DESC, TripEventID DESC;
      `);

    return NextResponse.json({
      ok: true,
      events: result.recordset,
    });
  } catch (err) {
    console.error('Trip events query failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// POST /api/trips/[id]/events - Create new trip event
export async function POST(req: Request, { params }: RouteContext) {
  try {
    const tripId = Number(params.id);
    if (!tripId || Number.isNaN(tripId)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const eventType = body.eventType as string;
    const city = (body.city as string | undefined) ?? null;
    const state = (body.state as string | undefined) ?? null;
    const note = (body.note as string | undefined) ?? null;
    const eventTime = body.eventTime
      ? new Date(body.eventTime)
      : new Date();

    if (!eventType) {
      return NextResponse.json(
        { ok: false, error: 'eventType is required' },
        { status: 400 }
      );
    }

    const pool = await getDb();

    const result = await pool
      .request()
      .input('TripId', sql.Int, tripId)
      .input('EventType', sql.NVarChar(50), eventType)
      .input('EventTime', sql.DateTime2, eventTime)
      .input('City', sql.NVarChar(100), city)
      .input('State', sql.NVarChar(50), state)
      .input('Note', sql.NVarChar(500), note)
      .query(`
        INSERT INTO dbo.TripEvents (TripID, EventType, EventTime, City, State, Note)
        OUTPUT INSERTED.*
        VALUES (@TripId, @EventType, @EventTime, @City, @State, @Note);
      `);

    const newEvent = result.recordset[0];

    return NextResponse.json({
      ok: true,
      event: newEvent,
    });
  } catch (err) {
    console.error('Trip event creation failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
