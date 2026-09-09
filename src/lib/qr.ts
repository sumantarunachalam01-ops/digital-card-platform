import QRCode from 'qrcode';

export async function generateQrPngDataUrl(url: string): Promise<string> {
  return await QRCode.toDataURL(url, {
    width: 600,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

export async function generateQrSvgString(url: string): Promise<string> {
  return await QRCode.toString(url, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}
