/**
 * Envoi de l'extrait (prologue, 10 premières pages).
 *
 * Appelée en POST sur /api/extrait par le formulaire "Recevez le prologue".
 * INDÉPENDANTE de Netlify Forms : aucune collision possible avec
 * submission-created.js, qui ne traite que le formulaire "contact".
 *
 * Prérequis :
 *   - RESEND_API_KEY en variable d'environnement Netlify.
 *   - Le PDF déposé dans /telechargements/ à la racine du dépôt.
 *   - Domaine de l'adresse FROM vérifié dans Resend.
 */

const OWNER_EMAIL = "amizeret@gmail.com";
const FROM = "Aurélien Mizeret <hello@aurelienmizeret.com>";

// Chemin du PDF, relatif à la racine du site. L'URL absolue est reconstruite
// à partir du domaine réel de la requête : fonctionne aussi bien sur
// cequeliafaitdenous.com que sur une preview Netlify.
const PDF_FILE = "/telechargements/extrait-livre-9f3c21.pdf";
const PDF_NAME = "Ce-que-l-IA-fait-de-nous-Prologue.pdf";

const LINKS = {
  site: "https://aurelienmizeret.com/",
  linkedin: "https://www.linkedin.com/in/aur%C3%A9lien-mizeret/",
  whatsapp: "https://wa.me/33619958971",
  youtube: "https://www.youtube.com/@Le_dirigeant_augment%C3%A9",
  events: "https://www.eventbrite.fr/o/121541945462"
};

// ---- Palette (identique à submission-created.js) ----
const C = {
  paper: "#F4F2EA", card: "#FBFAF4", encre: "#152230", texte: "#374553",
  muet: "#67757F", ligne: "#E2DED2", bleu: "#255C82", ambre: "#C99A4A", ivoire: "#F6F3E9"
};

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
           .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Enveloppe commune : bandeau + carte centrée, compatible clients mail.
function shell(innerHTML, preheader = "") {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:28px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:${C.card};border:1px solid ${C.ligne};border-radius:18px;overflow:hidden;">
      <tr><td style="background:${C.bleu};padding:22px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:600;color:${C.ivoire};">Ce que l'IA fait de nous</td>
          <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(246,243,233,.75);">Aurélien Mizeret</td>
        </tr></table>
      </td></tr>
      <tr><td style="height:4px;background:${C.ambre};"></td></tr>
      <tr><td style="padding:34px 32px 30px 32px;font-family:Arial,Helvetica,sans-serif;color:${C.texte};font-size:15px;line-height:1.6;">
        ${innerHTML}
      </td></tr>
      <tr><td style="padding:18px 32px;border-top:1px solid ${C.ligne};font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${C.muet};">
        Envoyé depuis <a href="${LINKS.site}" style="color:${C.bleu};text-decoration:none;">aurelienmizeret.com</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// ---- Mail au lecteur : le prologue ----
function extraitEmail(pdfUrl) {
  const linkStyle = `color:${C.bleu};text-decoration:none;font-weight:bold;`;
  const inner = `
    <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;color:${C.encre};">Voici le prologue.</p>
    <p style="margin:0 0 18px;">Il est en pièce jointe de ce message. Prenez-le lentement — ce ne sont pas des pages qu'on survole.</p>

    <div style="margin:0 0 26px;padding:18px 22px;background:${C.paper};border-left:3px solid ${C.ambre};border-radius:6px;">
      <div style="font-family:Georgia,serif;font-style:italic;font-size:17px;line-height:1.5;color:${C.encre};">
        « Nous n'aurons pas été remplacés.<br>Nous nous serons absentés. »
      </div>
      <div style="margin-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${C.muet};">Prologue — L'éclaireur</div>
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 26px;"><tr>
      <td style="background:${C.bleu};border-radius:100px;">
        <a href="${pdfUrl}" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${C.ivoire};text-decoration:none;">Ouvrir le prologue</a>
      </td>
    </tr></table>

    <p style="margin:0 0 8px;">Si quelque chose vous heurte ou vous parle, répondez simplement à ce message : il arrive directement chez moi, et je lis tout.</p>
    <p style="margin:0 0 8px;">En attendant la sortie, on peut aussi se croiser ici :</p>
    <p style="margin:0 0 24px;line-height:2;">
      <a href="${LINKS.site}" style="${linkStyle}">Le site</a> &nbsp;·&nbsp;
      <a href="${LINKS.linkedin}" style="${linkStyle}">LinkedIn</a> &nbsp;·&nbsp;
      <a href="${LINKS.youtube}" style="${linkStyle}">YouTube</a> &nbsp;·&nbsp;
      <a href="${LINKS.events}" style="${linkStyle}">Mes événements</a>
    </p>

    <p style="margin:0;padding-top:18px;border-top:1px solid ${C.ligne};font-family:Georgia,serif;font-size:15px;color:${C.encre};">
      Aurélien Mizeret<br>
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.muet};">Consultant · Formateur · Éclaireur</span>
    </p>`;
  return shell(inner, "Le prologue de « Ce que l'IA fait de nous » vous attend en pièce jointe.");
}

// ---- Notification interne ----
function notifEmail(email, when) {
  const inner = `
    <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;color:${C.encre};">Prologue demandé</p>
    <p style="margin:0 0 20px;color:${C.muet};">Nouvelle inscription via le formulaire de la landing page.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:10px 0;border-top:1px solid ${C.ligne};font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${C.muet};width:130px;">E-mail</td>
        <td style="padding:10px 0;border-top:1px solid ${C.ligne};font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${C.encre};">
          <a href="mailto:${esc(email)}" style="color:${C.bleu};text-decoration:none;">${esc(email)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-top:1px solid ${C.ligne};font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${C.muet};">Reçu le</td>
        <td style="padding:10px 0;border-top:1px solid ${C.ligne};font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${C.encre};">${esc(when)}</td>
      </tr>
    </table>`;
  return shell(inner, `Prologue demandé — ${email}`);
}

async function send(key, body) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error("Resend error", res.status, detail);
    return false;
  }
  return true;
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY manquante — aucun e-mail envoyé.");
    return Response.json({ error: "configuration" }, { status: 500 });
  }

  let data = {};
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "requête illisible" }, { status: 400 });
  }

  // Honeypot : on répond OK au robot, sans rien envoyer.
  if (data["bot-field"]) return Response.json({ ok: true });

  const email = String(data.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "adresse invalide" }, { status: 400 });
  }

  // URL absolue du PDF, déduite du domaine réellement utilisé.
  const pdfUrl = new URL(PDF_FILE, req.url).href;

  const ok = await send(key, {
    from: FROM,
    to: [email],
    reply_to: OWNER_EMAIL,
    subject: "Le prologue — Ce que l'IA fait de nous",
    html: extraitEmail(pdfUrl),
    attachments: [{ filename: PDF_NAME, path: pdfUrl }]
  });

  if (!ok) return Response.json({ error: "envoi impossible" }, { status: 502 });

  // Notification pour l'auteur — sans bloquer la réponse au visiteur.
  const when = new Date().toLocaleString("fr-FR", {
    dateStyle: "long", timeStyle: "short", timeZone: "Europe/Brussels"
  });
  await send(key, {
    from: FROM,
    to: [OWNER_EMAIL],
    reply_to: email,
    subject: `Prologue demandé — ${email}`,
    html: notifEmail(email, when)
  });

  return Response.json({ ok: true });
};

export const config = { path: "/api/extrait" };
