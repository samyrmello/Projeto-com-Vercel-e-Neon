import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { cleanText } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = cleanText(body.email,255).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const rows = await sql`SELECT id,name,email,password_hash FROM users WHERE email=${email} LIMIT 1`;
    const user = rows[0] as {id:string;name:string;email:string;password_hash:string}|undefined;
    if (!user || !(await bcrypt.compare(password,user.password_hash))) return NextResponse.json({error:'E-mail ou senha incorretos.'},{status:401});
    await createSession(user.id);
    return NextResponse.json({user:{id:user.id,name:user.name,email:user.email}});
  } catch { return NextResponse.json({error:'Não foi possível entrar.'},{status:500}); }
}
