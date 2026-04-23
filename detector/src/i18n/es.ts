import type { Messages } from './types.js';

export const es: Messages = {
  'title.safe':                           'Parece legítimo',
  'title.unrecognized':                   'Servicio de reuniones no reconocido',
  'title.invalid.unparseable':            'URL no válida',
  'title.invalid.protocol':               'Protocolo no admitido',
  'title.invalid.empty':                  'Pega un enlace de reunión',
  'title.invalid.no_url':                 'No se encontró ningún enlace',
  'title.invalid.scheme':                 'No es un enlace web',
  'title.dangerous.community':            'Estafa confirmada',
  'title.dangerous.subdomain_trick':      'Casi con certeza una estafa',
  'title.dangerous.impersonation':        'Casi con certeza una estafa',
  'title.dangerous.homoglyph':            'Casi con certeza una estafa',

  'reason.safe':
    'Este es un dominio real de {brand}. Confirma siempre al remitente por un canal de confianza antes de unirte a la llamada.',
  'reason.unrecognized':
    'Este dominio no está en nuestra lista de servicios de reuniones oficiales (Zoom, Google Meet, Teams, Webex, Calendly y otros). Si alguien te lo envió como enlace de reunión, no lo abras sin verificar por un canal de confianza.',
  'reason.invalid.unparseable':
    'No se pudo analizar esto como una URL. Pega el enlace completo empezando por https://',
  'reason.invalid.protocol':
    'El protocolo {protocol} no está admitido. Pega un enlace http(s).',
  'reason.invalid.empty':
    'Pega un enlace de reunión arriba para verificarlo.',
  'reason.invalid.no_url':
    'No encontramos ninguna URL en ese texto. Pega el enlace de la reunión solo, o asegúrate de incluirlo.',
  'reason.invalid.scheme.zoommtg':
    'Este es un enlace de la app nativa de Zoom (zoommtg://). Pega en su lugar la versión https:// de la invitación.',
  'reason.invalid.scheme.msteams':
    'Este es un enlace de la app nativa de Microsoft Teams (msteams:). Pega en su lugar la versión https:// de la invitación.',
  'reason.invalid.scheme.tel':
    'Este es un enlace telefónico (tel:), no un enlace de reunión.',
  'reason.invalid.scheme.mailto':
    'Este es un enlace de correo (mailto:), no un enlace de reunión.',
  'reason.dangerous.community':
    '{domain} ha sido denunciado por la comunidad como una estafa. No abras este enlace.',
  'reason.dangerous.subdomain_trick':
    'El dominio real aquí es {fakeDomain}, no {brand}. Es un patrón clásico de suplantación por subdominio. No abras este enlace.',
  'reason.dangerous.impersonation':
    'Este dominio intenta parecer un servicio de reuniones real pero no está en la lista oficial. Coincide con el patrón exacto usado en las campañas de Zoom falso de febrero de 2026. No abras este enlace.',
  'reason.dangerous.homoglyph':
    'Este dominio usa caracteres visualmente confusos (cirílicos, griegos o punycode) para suplantar a {brand}. Sin el engaño, se parece a "{skeleton}". No abras este enlace.',

  'signal.hostname.label':                'Dominio',
  'signal.hostname.detail':               '{host}',
  'signal.official.label':                'Verificado',
  'signal.official.detail':               'dominio oficial de {brand}',
  'signal.subdomain_trick.label':         'Trampa de subdominio',
  'signal.subdomain_trick.detail':        'simula ser {brand}; el dominio real es {fakeDomain}',
  'signal.brand_impersonation.label':     'Suplantación',
  'signal.brand_impersonation.detail':    'contiene "{token}" pero no está en la lista oficial de {brand}',
  'signal.typosquat.label':               'Typosquat',
  'signal.typosquat.detail':              '{brand} mal escrito',
  'signal.community_reports.label':       'Denunciado por la comunidad',
  'signal.community_reports.detail':      '{domain} está en el feed de amenazas confirmado',
  'signal.suspicious_tld.label':          'TLD sospechoso',
  'signal.suspicious_tld.detail':         '{tld}',
  'signal.punycode.label':                'Punycode',
  'signal.punycode.detail':               'caracteres unicode en el dominio',
  'signal.homoglyph.label':               'Ataque homógrafo',
  'signal.homoglyph.detail':              'se decodifica como "{skeleton}" — suplanta a {brand}',
  'signal.no_https.label':                'Protocolo',
  'signal.no_https.detail':               'no usa HTTPS',
  'signal.not_official.label':            'No reconocido',
  'signal.not_official.detail':           'no está en la lista de servicios de reuniones oficiales',
};
