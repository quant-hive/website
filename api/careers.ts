import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { DATA_DIR, EMAIL_RE, escapeHtml, mailer, oneLine, rateLimited } from "./waitlist.js"; // .js: how Node on Vercel finds the compiled file; Bun and TypeScript map it to .ts

// The Careers page's applications: POST /api/careers (server.ts; on Vercel this
// file is the function), as multipart form data in two steps' worth of fields —
// the role, name and email, then a CV (required) and a phone number (optional).
// Each application is:
//
//   1. filed in Google Drive and the applicants' sheet, by the Apps Script in
//      scripts/careers-apps-script.gs (CAREERS_SHEET_URL, CAREERS_SHEET_SECRET):
//      the CV saved to the careers folder, a row added with its Drive link;
//   2. mailed to CAREERS_TO (default: WAITLIST_TO, then mail@quanthive.in) over
//      the waitlist's SMTP settings, the CV attached and its Drive link given;
//   3. written to data/careers.jsonl where the disk allows it (no CV).
//
// It's taken if any of the three succeeds.

const LOG_FILE = join(DATA_DIR, "careers.jsonl");
const TO = process.env.CAREERS_TO || process.env.WAITLIST_TO || "mail@quanthive.in";
const SHEET_URL = process.env.CAREERS_SHEET_URL;
const SHEET_SECRET = process.env.CAREERS_SHEET_SECRET;

/** Under Vercel's 4.5 MB request limit, with room for the other fields. */
export const CV_MAX_BYTES = 4 * 1024 * 1024;
const CV_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

type Cv = { name: string; type: string; bytes: Uint8Array };
type Application = { name: string; email: string; role: string; phone: string; cv: Cv };

async function validate(form: FormData): Promise<{ application: Application } | { error: string }> {
  const read = (key: string, max: number) => {
    const value = form.get(key);
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  };
  const name = read("name", 120);
  const email = read("email", 200);
  const role = read("role", 120);
  const phone = read("phone", 30);
  if (!name) return { error: "Please add your name." };
  if (!EMAIL_RE.test(email)) return { error: "Please add a valid email." };
  if (!role) return { error: "Please pick a role." };
  // Optional; if given, something a person could dial: digits with the usual marks.
  if (phone && !(/^\+?[\d\s().-]+$/.test(phone) && (phone.match(/\d/g)?.length ?? 0) >= 7 && (phone.match(/\d/g)?.length ?? 0) <= 15))
    return { error: "Please check your phone number." };

  const file = form.get("cv");
  if (!(file instanceof File) || file.size === 0) return { error: "Please attach your CV." };
  if (file.size > CV_MAX_BYTES) return { error: "Your CV is over 4 MB — please attach a smaller file." };
  const ext = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
  if (!CV_TYPES[ext]) return { error: "Please attach your CV as a PDF or Word file." };
  const cv = { name: file.name.replace(/[\\/:*?"<>|\r\n]+/g, "_").slice(0, 140), type: CV_TYPES[ext]!, bytes: new Uint8Array(await file.arrayBuffer()) };
  return { application: { name, email, role, phone, cv } };
}

/** The CV into the careers Drive folder, the applicant into the sheet; the
 *  CV's Drive link back. Null when not set up or it fails (the mail still goes). */
async function fileToDrive(application: Application, appliedAt: string): Promise<string | null> {
  if (!SHEET_URL || !SHEET_SECRET) {
    console.warn("[careers] Google filing not configured (CAREERS_SHEET_URL/SECRET) — CV not saved to Drive.");
    return null;
  }
  const { cv, ...fields } = application;
  try {
    // Apps Script answers a POST with a redirect to its result; fetch follows it.
    const response = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret: SHEET_SECRET,
        ...fields,
        appliedAt,
        file: { name: cv.name, type: cv.type, base64: Buffer.from(cv.bytes).toString("base64") },
      }),
      signal: AbortSignal.timeout(25_000),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean; fileUrl?: string; error?: string } | null;
    if (!response.ok || !result?.ok || !result.fileUrl) throw new Error(result?.error || `HTTP ${response.status}`);
    return result.fileUrl;
  } catch (error) {
    console.error("[careers] Drive/sheet filing failed:", error);
    return null;
  }
}

async function deliver(application: Application, meta: { ip: string; ua: string }) {
  const appliedAt = new Date().toISOString();
  const { cv, ...fields } = application;

  const driveUrl = await fileToDrive(application, appliedAt);

  let stored = false;
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(LOG_FILE, JSON.stringify({ ...fields, cv: cv.name, driveUrl, at: appliedAt, ...meta }) + "\n");
    stored = true;
  } catch (error) {
    console.warn("[careers] could not store application (read-only disk?):", error);
  }

  let mailed = false;
  const smtp = mailer();
  if (!smtp) console.warn("[careers] SMTP not configured (SMTP_HOST/USER/PASS) — application not mailed.");
  else {
    const rows: [string, string][] = [
      ["Role", application.role],
      ["Name", application.name],
      ["Email", application.email],
      ["Phone", application.phone || "—"],
      ["CV", driveUrl ? `${cv.name} (attached; in Drive: ${driveUrl})` : `${cv.name} (attached)`],
      ["Applied", appliedAt],
    ];
    try {
      await smtp.sendMail({
        from: `"QuantHive careers" <${process.env.WAITLIST_FROM || process.env.SMTP_USER}>`,
        to: TO,
        replyTo: oneLine(`"${application.name.replace(/"/g, "")}" <${application.email}>`),
        subject: oneLine(`Application: ${application.role} — ${application.name}`),
        text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
        html:
          `<h2 style="font:600 18px system-ui,sans-serif;margin:0 0 12px">New application from the Careers page</h2>` +
          `<table style="font:14px system-ui,sans-serif;border-collapse:collapse">` +
          rows
            .map(([k, v]) => {
              const cell = k === "CV" && driveUrl
                ? `${escapeHtml(cv.name)} — attached · <a href="${escapeHtml(driveUrl)}">open in Drive</a>`
                : escapeHtml(v);
              return `<tr><td style="padding:4px 16px 4px 0;color:#666">${k}</td><td style="padding:4px 0">${cell}</td></tr>`;
            })
            .join("") +
          `</table>`,
        attachments: [{ filename: cv.name, content: Buffer.from(cv.bytes), contentType: cv.type }],
      });
      mailed = true;
    } catch (error) {
      console.error("[careers] mail failed:", error);
    }
  }
  if (!driveUrl && !stored && !mailed) throw new Error("application neither filed, stored nor mailed");
  return { mailed, filed: !!driveUrl };
}

/** POST /api/careers: the whole request, for server.ts and for Vercel. */
export async function handleCareers(req: Request, fallbackIp = "unknown") {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || fallbackIp;
  if (rateLimited(ip)) return Response.json({ ok: false, error: "Too many tries — please wait a few minutes." }, { status: 429 });
  if (Number(req.headers.get("content-length") ?? 0) > CV_MAX_BYTES + 256 * 1024)
    return Response.json({ ok: false, error: "Your CV is over 4 MB — please attach a smaller file." }, { status: 413 });
  const form = await req.formData().catch(() => null);
  if (!form) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  // A field people never see; bots fill it in.
  if (form.get("website")) return Response.json({ ok: true });
  const result = await validate(form);
  if ("error" in result) return Response.json({ ok: false, error: result.error }, { status: 400 });
  try {
    const outcome = await deliver(result.application, { ip, ua: req.headers.get("user-agent") ?? "" });
    return Response.json({ ok: true, ...outcome });
  } catch (error) {
    console.error("[careers] could not take application:", error);
    return Response.json({ ok: false, error: "Something went wrong — please try again." }, { status: 500 });
  }
}

/** Vercel's entry point (a web-standard handler). server.ts doesn't use it. */
export const POST = (req: Request) => handleCareers(req);
