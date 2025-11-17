// src/app/api/trip-cost/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs'; // make sure this runs in Node, not edge

type TripCostRequest = {
  tripId: number;
  isManual?: boolean;
  manualTotalCost?: number | null;
  manualReason?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TripCostRequest;

    const tripId = Number(body.tripId);
    const isManual = body.isManual === true;
    const manualTotalCost =
      body.manualTotalCost !== undefined ? Number(body.manualTotalCost) : null;
    const manualReason =
      body.manualReason !== undefined && body.manualReason !== null
        ? String(body.manualReason)
        : null;

    if (!tripId || Number.isNaN(tripId)) {
      return NextResponse.json(
        { ok: false, error: 'tripId is required and must be a number' },
        { status: 400 }
      );
    }

    const pool = await getDb();

    // 1) Call the stored procedure to (re)calculate the cost
    await pool
      .request()
      .input('TripId', sql.Int, tripId)
      .input('IsManual', sql.Bit, isManual ? 1 : 0)
      .input('ManualTotalCost', sql.Decimal(10, 2), manualTotalCost)
      .input('ManualReason', sql.NVarChar(200), manualReason)
      .execute('usp_RecalculateTripCost');

    // 2) Return the latest TripCost row for that trip
    const result = await pool
      .request()
      .input('TripId', sql.Int, tripId)
      .query(`
        SELECT TOP (1) *
        FROM dbo.TripCosts
        WHERE TripID = @TripId
        ORDER BY CostID DESC;
      `);

    const cost = result.recordset[0] ?? null;

    return NextResponse.json({
      ok: true,
      tripId,
      cost,
    });
  } catch (err: any) {
    console.error('Trip cost API error', err);
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
