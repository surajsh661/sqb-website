// Shared spam / bot filtering used by the contact API (server) and the
// Reach Out form (client) so disposable inboxes are blocked before they submit.

// Known disposable / temporary-mail domains (the common offenders). The
// substring heuristics below catch the long tail of look-alikes.
const DISPOSABLE_DOMAINS = new Set<string>([
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'guerrillamail.com', 'guerrillamail.info',
  'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'guerrillamailblock.com', 'sharklasers.com',
  'grr.la', 'spam4.me', 'pokemail.net', '10minutemail.com', '10minutemail.net', '20minutemail.com',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net', 'tempmailo.com', 'tempr.email',
  'tempmail.plus', 'tmpmail.org', 'tmpmail.net', 'tmpeml.com', 'tmails.net', 'minutemail.com',
  'throwawaymail.com', 'throwam.com', 'getnada.com', 'nada.email', 'getairmail.com', 'maildrop.cc',
  'mailcatch.com', 'mailnesia.com', 'mailsac.com', 'inboxkitten.com', 'fakeinbox.com', 'fakemail.net',
  'emailfake.com', 'fakemailgenerator.com', 'yopmail.com', 'yopmail.net', 'yopmail.fr', 'cool.fr.nf',
  'jetable.org', 'mintemail.com', 'mohmal.com', 'mailnull.com', 'spamgourmet.com', 'trashmail.com',
  'trashmail.net', 'trashmail.de', 'trbvm.com', 'wegwerfmail.de', 'wegwerfmail.net', 'discard.email',
  'discardmail.com', 'dispostable.com', 'mailmetrash.com', 'harakirimail.com', 'incognitomail.com',
  'objectmail.com', 'proxymail.eu', 'rcpt.at', 'spambog.com', 'tempinbox.com', 'mytemp.email',
  'mailpoof.com', 'etempmail.net', 'moakt.com', 'moakt.cc', 'mvrht.net', 'dropmail.me', '1secmail.com',
  '1secmail.net', '1secmail.org', 'burnermail.io', '33mail.com', 'anonbox.net', 'emailondeck.com',
  'luxusmail.org', 'tafmail.com', 'cs.email', 'byom.de', 'mailbox.in.ua', 'mailto.plus', 'fexbox.org',
  'rover.info', 'inbox.lv', 'vmani.com', 'gufum.com', 'gixenmixen.com', 'horsefundsing.com',
  'flymail.tk', 'tutuapp.bid', 'banit.club', 'one-time.email', 'linshiyouxiang.net', 'snapwet.com',
]);

// If the domain contains any of these, treat it as disposable (look-alikes,
// regional clones, and the endless mailinator/tempmail variants).
const DISPOSABLE_PATTERNS = [
  'mailinator', 'guerrilla', 'tempmail', 'temp-mail', 'tempemail', 'temp-email', '10minute',
  'minutemail', 'throwaway', 'throwam', 'disposable', 'trashmail', 'trash-mail', 'fakemail',
  'fakeinbox', 'yopmail', 'getnada', 'getairmail', 'sharklasers', 'maildrop', 'mailcatch',
  'mailnesia', 'mailsac', 'spamgourmet', 'mohmal', 'burnermail', 'dropmail', '1secmail',
  'emailfake', 'tempinbox', 'mailpoof', 'wegwerf', 'spam4', 'discardmail', 'mvrht', 'moakt',
  'tmpmail', 'tmpeml', 'inboxkitten', 'mailnull', 'jetable', 'incognitomail',
];

export function isValidEmail(email: string): boolean {
  // single @, a dot in the domain, no spaces, sane length
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  return DISPOSABLE_PATTERNS.some((p) => domain.includes(p));
}
