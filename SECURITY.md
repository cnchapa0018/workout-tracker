# Security Policy

## Reporting a vulnerability

If you believe you've found a security vulnerability in WorkIn.ai, please report it privately.

- **Preferred:** open a [GitHub private security advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
  (Security → Advisories → "Report a vulnerability") so the report stays confidential until a fix ships.
- **Or email:** cnchapa0018@gmail.com

Please include steps to reproduce, the impact, and any relevant logs or proof-of-concept. We aim to
acknowledge reports within a few days. Please give us a reasonable window to remediate before any public
disclosure.

**Do not** open a public issue for security problems, and please don't run automated scanners or load tests
against any hosted/production instance.

## Supported versions

This is an actively developed application; security fixes target the latest `main`.

## How security is enforced

- **Row-Level Security** on every user-owned table (`auth.uid() = user_id`); the browser only ever holds the
  public Supabase anon key.
- **Privileged secrets** (Supabase service role, Spotify/YouTube/USDA keys) live only in the server-side
  api-proxy, which adds a CORS origin allowlist and per-IP rate limiting.
- **On-device vision** — camera frames are processed locally; only derived metadata is stored.
- **Automated CI scanning** on every pull request: SAST (Semgrep + CodeQL), dependency audit, secret
  scanning, SQL-injection detection, license compliance, GitHub Actions hardening, and SBOM generation.

For public repositories, also enable GitHub's free native **secret scanning + push protection** under
*Settings → Code security and analysis*.
