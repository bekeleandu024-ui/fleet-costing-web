// C:\Users\bekel\Desktop\fleet-costing-web\src\app\api\orders\route.ts

import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getDb } from '@/lib/db';

// GET /api/orders  -> latest 100 orders
export async function GET() {
  try {
    const pool = await getDb();

    const result = await pool.request().query(`
      SELECT TOP (100)
        o.OrderID,
        o.CustomerID,
        o.Customer,
        o.Origin,
        o.Destination,
        o.Miles,
        o.Revenue,
        o.Status
      FROM dbo.Orders o
      ORDER BY o.OrderID DESC;
    `);

    return NextResponse.json({
      ok: true,
      rowCount: result.recordset.length,
      orders: result.recordset,
    });
  } catch (err) {
    console.error('Orders GET failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// POST /api/orders  -> create a new order
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const customer = (body.customer as string | undefined) ?? null;
    const origin = body.origin as string | undefined;
    const destination = body.destination as string | undefined;
    const miles = Number(body.miles);
    const revenue = Number(body.revenue);

    if (!origin || !destination || !Number.isFinite(miles) || !Number.isFinite(revenue)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'origin, destination, miles, and revenue are required (miles & revenue must be numbers).',
        },
        { status: 400 }
      );
    }

    const pool = await getDb();

    const insertResult = await pool
      .request()
      .input('Customer', sql.NVarChar(100), customer)
      .input('Origin', sql.NVarChar(400), origin)
      .input('Destination', sql.NVarChar(400), destination)
      .input('Miles', sql.Int, miles)
      .input('Revenue', sql.Decimal(10, 2), revenue)
      .input('Status', sql.NVarChar(50), 'Planned')
      .query(`
        INSERT INTO dbo.Orders (Customer, Origin, Destination, Miles, Revenue, Status)
        OUTPUT INSERTED.*
        VALUES (@Customer, @Origin, @Destination, @Miles, @Revenue, @Status);
      `);

    const newOrder = insertResult.recordset[0];

    return NextResponse.json({
      ok: true,
      order: newOrder,
    });
  } catch (err) {
    console.error('Orders POST failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
