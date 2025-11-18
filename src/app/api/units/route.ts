import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDb();

    const result = await pool.request().query(`
      SELECT
        UnitID,
        UnitNumber,
        DriverID
      FROM dbo.Units
      ORDER BY UnitNumber;
    `);

    return NextResponse.json({
      ok: true,
      rowCount: result.recordset.length,
      units: result.recordset,
    });
  } catch (err) {
    console.error('Units query failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
