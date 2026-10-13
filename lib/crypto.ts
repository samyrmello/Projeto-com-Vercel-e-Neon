import 'server-only';
import crypto from 'node:crypto';

function getKey() {
  const value = process.env.VAULT_ENCRYPTION_KEY;
  if (!value) throw new Error('VAULT_ENCRYPTION_KEY não configurada.');
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32) throw new Error('VAULT_ENCRYPTION_KEY deve ter exatamente 32 bytes em base64.');
  return key;
}

export function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.');
}

export function decrypt(payload: string) {
  const [ivText, tagText, encryptedText] = payload.split('.');
  if (!ivText || !tagText || !encryptedText) throw new Error('Credencial criptografada inválida.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64url')), decipher.final()]).toString('utf8');
}
