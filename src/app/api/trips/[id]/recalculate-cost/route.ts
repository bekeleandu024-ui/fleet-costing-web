// src/app/api/trips/[id]/recalculate-cost/route.ts
import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getDb } from '@/lib/db';

type RouteParams = { params: { id: string } };

export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const tripId = Number(params.id);
    const body = await _req.json().catch(() => ({}));

    const isManual = Boolean(body.isManual);
    const manualTotalCost = body.manualTotalCost as number | undefined;
    const manualReason = (body.manualReason as string | undefined) ?? null;

    if (!tripId || Number.isNaN(tripId)) {
      return NextResponse.json(
        { ok: false, error: 'Trip id must be a number' },
        { status: 400 }
      );
    }

    if (isManual && (manualTotalCost === undefined || Number.isNaN(manualTotalCost))) {
      return NextResponse.json(
        { ok: false, error: 'manualTotalCost is required when isManual = true.' },
        { status: 400 }
      );
    }

    const pool = await getDb();

    await pool
      .request()
      .input('TripId', sql.Int, tripId)
      .input('IsManual', sql.Bit, isManual ? 1 : 0)
      .input('ManualTotalCost', sql.Decimal(10, 2), isManual ? manualTotalCost! : null)
      .input('ManualReason', sql.NVarChar(200), manualReason)
      .execute('dbo.usp_RecalculateTripCost');

    const latestCostResult = await pool
      .request()
      .input('TripId', sql.Int, tripId)
      .query(`
        SELECT TOP (1)
          CostID,
          TripID,
          Miles,
          TotalCPM,
          TotalCost,
          Revenue,
          Profit,
          IsManual,
          ManualTotalCost,
          ManualReason,
          CreatedAt,
          WageMultiplier,
          AccessorialCost
        FROM dbo.TripCosts
        WHERE TripID = @TripId
        ORDER BY CreatedAt DESC, CostID DESC;
      `);

    const latestCost = latestCostResult.recordset[0] ?? null;

    return NextResponse.json({ ok: true, tripId, latestCost });
  } catch (err) {
    console.error('Recalculate-cost failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
