import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import { sql } from '@/lib/db';
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({error:'Não autenticado.'},{status:401});
  const rows = await sql`SELECT id,name,email FROM users WHERE id=${userId} LIMIT 1`;
  if (!rows.length) return NextResponse.json({error:'Usuário não encontrado.'},{status:401});
  return NextResponse.json({user:rows[0]});
}
