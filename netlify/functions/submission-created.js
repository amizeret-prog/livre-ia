/**
 * Fonction déclenchée AUTOMATIQUEMENT par Netlify à chaque soumission
 * d'un formulaire Netlify Forms (le nom de fichier "submission-created"
 * est ce qui la relie à l'événement — ne pas le renommer).
 *
 * Elle envoie deux e-mails via Resend :
 *   1) une copie stylée à l'auteur (amizeret@gmail.com), avec "répondre" pré-réglé sur le visiteur ;
 *   2) une confirmation stylée au visiteur, avec les coordonnées de l'auteur.
 *
 * Prérequis (voir les notes de déploiement) :
 *   - Variable d'environnement RESEND_API_KEY dans Netlify.
 *   - Domaine d'envoi vérifié dans Resend pour l'adresse FROM ci-dessous.
 */

const OWNER_EMAIL = "amizeret@gmail.com";
// ⬇ Domaine à VÉRIFIER dans Resend. Pour un test rapide, utilisez "onboarding@resend.dev".
const FROM = "Aurélien Mizeret <hello@aurelienmizeret.com>";

// Coordonnées publiques affichées dans l'e-mail de confirmation au visiteur.
const LINKS = {
  site: "https://aurelienmizeret.com/",
  linkedin: "https://www.linkedin.com/in/aur%C3%A9lien-mizeret/",
  whatsapp: "https://wa.me/33619958971",
  youtube: "https://www.youtube.com/@Le_dirigeant_augment%C3%A9",
  events: "https://www.eventbrite.fr/o/121541945462"
};

// ---- Palette (accordée à la landing page) ----
const C = {
  paper: "#F4F2EA", card: "#FBFAF4", encre: "#152230", texte: "#374553",
  muet: "#67757F", ligne: "#E2DED2", bleu: "#255C82", ambre: "#C99A4A", ivoire: "#F6F3E9"
};

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
           .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const nl2br = (s = "") => esc(s).replace(/\r?\n/g, "<br>");

// Enveloppe commune : bandeau + carte centrée, compatible clients mail (tables + styles inline).
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

function row(label, value) {
  if (!value) return "";
  return `<tr>
    <td style="padding:10px 0;border-top:1px solid ${C.ligne};font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${C.muet};width:130px;vertical-align:top;">${esc(label)}</td>
    <td style="padding:10px 0;border-top:1px solid ${C.ligne};font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${C.encre};">${value}</td>
  </tr>`;
}

function ownerEmail({ nom, email, objet, structure, message, when }) {
  const inner = `
    <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;color:${C.encre};">Nouveau message</p>
    <p style="margin:0 0 22px;color:${C.muet};">Reçu via le formulaire de contact.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row("Nom", esc(nom))}
      ${row("E-mail", `<a href="mailto:${esc(email)}" style="color:${C.bleu};text-decoration:none;">${esc(email)}</a>`)}
      ${row("Objet", esc(objet))}
      ${row("Structure", esc(structure))}
      ${row("Reçu le", esc(when))}
    </table>
    <div style="margin:22px 0 0;padding:18px 20px;background:${C.paper};border:1px solid ${C.ligne};border-radius:12px;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${C.muet};margin-bottom:8px;">Message</div>
      <div style="font-family:Georgia,serif;font-size:16px;line-height:1.55;color:${C.encre};">${nl2br(message) || "—"}</div>
    </div>
    <p style="margin:22px 0 0;font-size:13px;color:${C.muet};">Répondez directement à cet e-mail pour joindre ${esc(nom.split(" ")[0] || "cette personne")}.</p>`;
  return shell(inner, `Nouveau message de ${nom} — ${objet}`);
}

function visitorEmail({ prenom, objet, message }) {
  const linkStyle = `color:${C.bleu};text-decoration:none;font-weight:bold;`;
  const inner = `
    <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;color:${C.encre};">Merci${prenom ? ", " + esc(prenom) : ""}.</p>
    <p style="margin:0 0 18px;">Votre message est bien arrivé. Je lis personnellement chaque mot ; vous recevrez une réponse sous quelques jours.</p>
    <div style="margin:0 0 22px;padding:16px 20px;background:${C.paper};border-left:3px solid ${C.ambre};border-radius:6px;">
      <div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${C.muet};margin-bottom:6px;">Votre demande${objet ? " — " + esc(objet) : ""}</div>
      <div style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:${C.encre};">${nl2br(message)}</div>
    </div>
    <p style="margin:0 0 8px;">En attendant, on peut aussi se croiser ici :</p>
    <p style="margin:0 0 24px;line-height:2;">
      <a href="${LINKS.site}" style="${linkStyle}">Le site</a> &nbsp;·&nbsp;
      <a href="${LINKS.whatsapp}" style="${linkStyle}">WhatsApp</a> &nbsp;·&nbsp;
      <a href="${LINKS.linkedin}" style="${linkStyle}">LinkedIn</a> &nbsp;·&nbsp;
      <a href="${LINKS.events}" style="${linkStyle}">Mes événements</a>
    </p>
    <p style="margin:0;padding-top:18px;border-top:1px solid ${C.ligne};font-family:Georgia,serif;font-size:15px;color:${C.encre};">
      Aurélien Mizeret<br>
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.muet};">Consultant · Formateur · Éclaireur</span>
    </p>`;
  return shell(inner, "Votre message est bien arrivé — Aurélien Mizeret");
}

async function send({ to, subject, html, reply_to, key }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, ...(reply_to ? { reply_to } : {}) })
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text());
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const payload = body.payload || {};

    // On ne traite QUE le formulaire "contact" (ignore la newsletter, etc.).
    const formName = payload.form_name || (payload.data && payload.data["form-name"]);
    if (formName && formName !== "contact") {
      return { statusCode: 200, body: "ignored (" + formName + ")" };
    }

    const d = payload.data || {};
    const nom = (d.nom || "").trim();
    const email = (d.email || "").trim();
    const objet = (d.objet || "").trim();
    const structure = (d.structure || "").trim();
    const message = (d.message || "").trim();
    const prenom = nom.split(" ")[0] || "";
    const when = new Date(payload.created_at || Date.now())
      .toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Brussels" });

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.error("RESEND_API_KEY manquante — aucun e-mail envoyé.");
      return { statusCode: 500, body: "missing RESEND_API_KEY" };
    }

    // 1) Copie pour l'auteur (répondre = écrit directement au visiteur)
    await send({
      to: OWNER_EMAIL,
      subject: `Nouveau message — ${objet || "contact"}${structure ? " · " + structure : ""}`,
      html: ownerEmail({ nom, email, objet, structure, message, when }),
      reply_to: email || undefined,
      key
    });

    // 2) Confirmation stylée pour le visiteur
    if (email) {
      await send({
        to: email,
        subject: "Votre message est bien arrivé — Aurélien Mizeret",
        html: visitorEmail({ prenom, objet, message }),
        key
      });
    }

    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error("submission-created error", e);
    return { statusCode: 500, body: "error" };
  }
};
