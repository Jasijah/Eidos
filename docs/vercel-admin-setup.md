# Vercel Admin Setup

Eidos serves the public landing and beta signup experience to visitors. Product and operations routes require the configured administrator session.

## 1. Generate the password hash

From the repository root, run:

```powershell
pnpm hash:admin
```

Enter a password of at least 12 characters. The prompt masks the password and prints a PBKDF2-SHA256 hash. Store only that hash in Vercel. Do not add the password or hash to committed files.

## 2. Add environment variables

1. Open the Vercel dashboard.
2. Select the Eidos project.
3. Open **Settings > Environment Variables**.
4. Add these values to Production, Preview, and Development as appropriate:

```text
VITE_EIDOS_ADMIN_EMAIL=jasijahsmith1@gmail.com
VITE_EIDOS_ADMIN_PASSWORD_HASH=<output from pnpm hash:admin>
VITE_EIDOS_PUBLIC_SIGNUP_ONLY=true
VITE_EIDOS_ADMIN_PASSWORD_CHANGE_REQUIRED=false
```

Despite the `VITE_` names required by this project brief, the password hash is read only by Vercel serverless functions. Client code must never reference `VITE_EIDOS_ADMIN_PASSWORD_HASH`.

5. Redeploy the project so the functions receive the new values.

## 3. Sign in

Open `/admin-login`, enter `jasijahsmith1@gmail.com` and the original password used to create the hash. Successful authentication creates an eight-hour, `HttpOnly`, `Secure`, `SameSite=Strict` cookie. Use the logout control in the app header to end the session.

## Route behavior

Public routes are `/`, `/join-beta`, `/signup`, and `/admin-login`. Product, dashboard, settings, training, privacy, and presence routes redirect unauthenticated visitors to `/`.

## Beta signup delivery

Signups are stored in the visitor's local browser for MVP continuity. Configure `EIDOS_BETA_SIGNUP_WEBHOOK_URL` to additionally relay submissions to an approved backend. The administrator can export locally available signups from **Admin Console > Signup CSV**.

## Security boundary

The server validates the email and password hash and signs the session cookie. The browser never receives the password hash. The current app remains a static client application, so production beta data requiring centralized authorization should move to an authenticated backend before broader launch.

## Temporary admin password

For a first login with forced rotation, set VITE_EIDOS_ADMIN_PASSWORD_HASH to the temporary password hash and set VITE_EIDOS_ADMIN_PASSWORD_CHANGE_REQUIRED=true. After signing in, Eidos displays a password-change screen that generates the replacement hash. Update VITE_EIDOS_ADMIN_PASSWORD_HASH, set VITE_EIDOS_ADMIN_PASSWORD_CHANGE_REQUIRED=false, redeploy, then sign in with the new password.
