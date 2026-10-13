import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import { sql } from '@/lib/db';
import { cleanText } from '@/lib/validation';
import { encrypt, decrypt } from '@/lib/crypto';

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const userId=await getCurrentUserId(); if(!userId) return NextResponse.json({error:'Não autenticado.'},{status:401});
  const {id}=await params; const rows=await sql`SELECT id,title,website,username,password_ciphertext,notes,created_at,updated_at FROM credentials WHERE id=${id} AND user_id=${userId} LIMIT 1`;
  if(!rows.length) return NextResponse.json({error:'Credencial não encontrada.'},{status:404});
  const row:any=rows[0]; return NextResponse.json({credential:{...row,password:decrypt(row.password_ciphertext)}});
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const userId=await getCurrentUserId(); if(!userId) return NextResponse.json({error:'Não autenticado.'},{status:401});
  const {id}=await params; const rows=await sql`DELETE FROM credentials WHERE id=${id} AND user_id=${userId} RETURNING id`;
  if(!rows.length) return NextResponse.json({error:'Credencial não encontrada.'},{status:404});
  return NextResponse.json({ok:true});
}

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}) {
  const userId=await getCurrentUserId(); if(!userId) return NextResponse.json({error:'Não autenticado.'},{status:401});
  try {
    const {id}=await params; const body=await request.json();
    const title=cleanText(body.title,120),website=cleanText(body.website,500),username=cleanText(body.username,255),password=typeof body.password==='string'?body.password:'',notes=cleanText(body.notes,2000);
    if(!title||!username||!password) return NextResponse.json({error:'Campos obrigatórios ausentes.'},{status:400});
    const cipher=encrypt(password); const rows=await sql`UPDATE credentials SET title=${title},website=${website||null},username=${username},password_ciphertext=${cipher},notes=${notes||null},updated_at=NOW() WHERE id=${id} AND user_id=${userId} RETURNING id,title,website,username,notes,created_at,updated_at`;
    if(!rows.length) return NextResponse.json({error:'Credencial não encontrada.'},{status:404});
    return NextResponse.json({credential:{...rows[0],password}});
  } catch { return NextResponse.json({error:'Não foi possível atualizar o login.'},{status:500}); }
}
