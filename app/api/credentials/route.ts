import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import { sql } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/crypto';
import { cleanText } from '@/lib/validation';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({error:'Não autenticado.'},{status:401});
  const rows = await sql`SELECT id,title,website,username,password_ciphertext,notes,created_at,updated_at FROM credentials WHERE user_id=${userId} ORDER BY created_at DESC`;
  const credentials = rows.map((row:any)=>({...row,password:decrypt(row.password_ciphertext)}));
  return NextResponse.json({credentials});
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({error:'Não autenticado.'},{status:401});
  try {
    const body = await request.json();
    const title = cleanText(body.title,120), website=cleanText(body.website,500), username=cleanText(body.username,255), password=typeof body.password==='string'?body.password:'', notes=cleanText(body.notes,2000);
    if (!title || !username || !password) return NextResponse.json({error:'Nome do serviço, usuário e senha são obrigatórios.'},{status:400});
    const cipher = encrypt(password);
    const rows = await sql`INSERT INTO credentials (user_id,title,website,username,password_ciphertext,notes) VALUES (${userId},${title},${website||null},${username},${cipher},${notes||null}) RETURNING id,title,website,username,notes,created_at,updated_at`;
    return NextResponse.json({credential:{...rows[0],password}},{status:201});
  } catch { return NextResponse.json({error:'Não foi possível salvar o login.'},{status:500}); }
}
