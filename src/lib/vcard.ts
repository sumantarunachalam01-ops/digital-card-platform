import { ClientData } from '@/types';

export function generateVCard(client: ClientData): string {
  const nameParts = client.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${client.fullName}`,
  ];

  if (client.companyName) {
    lines.push(`ORG:${client.companyName}`);
  }

  if (client.designation) {
    lines.push(`TITLE:${client.designation}`);
  }

  if (client.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${client.phone}`);
  }

  if (client.whatsapp && client.whatsapp !== client.phone) {
    lines.push(`TEL;TYPE=WORK,MSG:${client.whatsapp}`);
  }

  if (client.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${client.email}`);
  }

  if (client.website) {
    lines.push(`URL:${client.website}`);
  }

  if (client.address) {
    // Standard ADR: PO Box;Extended;Street;Locality;Region;PostalCode;Country
    lines.push(`ADR;TYPE=WORK:;;${client.address.replace(/[\n\r]+/g, ' ')};;;;`);
  }

  if (client.bio) {
    lines.push(`NOTE:${client.bio.replace(/[\n\r]+/g, ' ')}`);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export function downloadVCard(client: ClientData) {
  const vcardString = generateVCard(client);
  const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${client.slug || 'contact'}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
