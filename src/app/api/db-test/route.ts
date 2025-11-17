import { NextResponse } from "next/server";
import sql from "mssql";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getDb();

const result = await pool.request().query(`
  SELECT TOP (5)
    TripID,
    DriverID,
    UnitID,
    Miles,
    MinimumRevenue,
    RequiredRevenue
  FROM dbo.Trips
  ORDER BY TripID DESC;
`);


    return NextResponse.json({
      ok: true,
      rowCount: result.recordset.length,
      trips: result.recordset,
    });
  } catch (err) {
    console.error("DB test failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: (err as Error).message ?? String(err),
      },
      { status: 500 }
    );
  }
}
