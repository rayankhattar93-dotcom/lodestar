const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://lodestarcareers.co',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    let name, email;
    try {
      const body = await request.json();
      name = (body.name || '').trim();
      email = (body.email || '').trim();
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    if (!name || !email) {
      return new Response(JSON.stringify({ success: false, error: 'Missing name or email' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const userEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Free Career Guides from Lodestar</title>
</head>
<body style="margin:0;padding:0;background:#0B0918;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0918;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#13102A;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:28px;color:#E040FB;letter-spacing:-0.5px;">Lodestar Careers</h1>
              <p style="margin:0;font-size:13px;color:#8888AA;">Your career, navigated.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="font-size:17px;color:#E8E6F0;margin:0 0 12px;">Hi ${name},</p>
              <p style="font-size:16px;color:#C8C4DC;line-height:1.6;margin:0 0 32px;">
                Your three free guides are ready. Click the links below to download them.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <a href="https://lodestarcareers.co/resources/Lodestar_CV_Checklist.pdf"
                       style="display:block;background:#E040FB;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;font-weight:bold;text-align:center;">
                      The CV Checklist
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <a href="https://lodestarcareers.co/resources/Lodestar_Job_Search_Roadmap.pdf"
                       style="display:block;background:#E040FB;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;font-weight:bold;text-align:center;">
                      Job Search Roadmap
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:0;">
                    <a href="https://lodestarcareers.co/resources/Lodestar_LinkedIn_Audit.pdf"
                       style="display:block;background:#E040FB;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;font-weight:bold;text-align:center;">
                      LinkedIn Audit Guide
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 40px;border-top:1px solid #1E1A3A;">
              <p style="margin:0;font-size:13px;color:#7070A0;text-align:center;line-height:1.8;">
                Lodestar Careers &nbsp;|&nbsp;
                <a href="mailto:guide@lodestarcareers.co" style="color:#7070A0;">guide@lodestarcareers.co</a>
                &nbsp;|&nbsp;
                <a href="https://lodestarcareers.co" style="color:#7070A0;">lodestarcareers.co</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const ownerEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Free Guides Request</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="max-width:500px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 16px;">
              <h2 style="margin:0 0 24px;font-size:20px;color:#13102A;">New Free Guides Request</h2>
              <p style="margin:0 0 12px;font-size:15px;color:#333;"><strong>Name:</strong> ${name}</p>
              <p style="margin:0;font-size:15px;color:#333;"><strong>Email:</strong> ${email}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 32px;border-top:1px solid #e8e8e8;">
              <p style="margin:0;font-size:13px;color:#888;">Sent via Lodestar Careers website</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const sendEmail = (to, subject, html) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'guide@lodestarcareers.co',
            to: [to],
            subject,
            html,
          }),
        });

      const [r1, r2] = await Promise.all([
        sendEmail(email, 'Your Free Career Guides from Lodestar', userEmailHtml),
        sendEmail('guide@lodestarcareers.co', 'New Free Guides Request - Lodestar', ownerEmailHtml),
      ]);

      if (!r1.ok || !r2.ok) {
        const e1 = !r1.ok ? await r1.text() : '';
        const e2 = !r2.ok ? await r2.text() : '';
        throw new Error(`Resend error: ${e1 || e2}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};
