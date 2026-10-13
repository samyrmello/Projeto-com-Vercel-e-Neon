import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { cleanText, validEmail } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = cleanText(body.name, 80);
    const email = cleanText(body.email, 255).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    if (!name || !validEmail(email) || password.length < 8) return NextResponse.json({error:'Nome, e-mail válido e senha com pelo menos 8 caracteres são obrigatórios.'},{status:400});
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length) return NextResponse.json({error:'Este e-mail já está cadastrado.'},{status:409});
    const hash = await bcrypt.hash(password, 12);
    const rows = await sql`INSERT INTO users (name,email,password_hash) VALUES (${name},${email},${hash}) RETURNING id,name,email`;
    const user = rows[0] as {id:string;name:string;email:string};
    await createSession(user.id);
    return NextResponse.json({user},{status:201});
  } catch { return NextResponse.json({error:'Não foi possível criar a conta.'},{status:500}); }
}
