import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { active_hours, distance, location_points = [], location_variance = 0 } = await req.json();

  const existing = await query(
    "SELECT id FROM activities WHERE user_id = $1 AND date = CURRENT_DATE",
    [user.id]
  );

  if (existing.rows.length > 0) {
    const result = await query(
      `UPDATE activities SET active_hours = $1, distance = $2, location_points = $3, location_variance = $4
       WHERE user_id = $5 AND date = CURRENT_DATE RETURNING *`,
      [active_hours, distance, JSON.stringify(location_points), location_variance, user.id]
    );
    return NextResponse.json({ activity: result.rows[0] });
  } else {
    const result = await query(
      `INSERT INTO activities (user_id, active_hours, distance, location_points, location_variance)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.id, active_hours, distance, JSON.stringify(location_points), location_variance]
    );
    return NextResponse.json({ activity: result.rows[0] });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const result = await query(
    "SELECT * FROM activities WHERE user_id = $1 ORDER BY date DESC LIMIT 7",
    [user.id]
  );
  return NextResponse.json({ activities: result.rows });
}
