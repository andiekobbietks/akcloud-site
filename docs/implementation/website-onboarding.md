# AKTOps website onboarding and deployment notes

## What the website does today

The public landing page is a static Netlify site. Its primary call to action opens an onboarding request form until a real booking URL is explicitly configured. The form captures a name, work email, organisation, service area and optional context through Netlify Forms.

The form is not an authenticated customer portal, does not create an Odoo record, and does not imply that a booking has been made. A successful submission means Netlify accepted the form submission. Configure a Netlify Forms notification or a reviewed server-side integration to route requests to the business inbox/CRM.

## Enable direct Odoo booking later

After Odoo Community 19 has been provisioned through Elestio BYOVM on OCI, tested and made publicly reachable over HTTPS:

1. Create the public appointment/booking route in the independently authored AKTOps addon.
2. Set the Netlify site environment variable `BOOKING_URL` to that public HTTPS booking URL.
3. Redeploy the site so the function receives the variable.
4. Verify `/.netlify/functions/get-config` returns `booking_enabled: true` and the expected URL.
5. Test every CTA on desktop and mobile and confirm the target booking page works.
6. Remove any obsolete Odoo Online references from operational documentation only after cutover is verified.

Until then, do not set `BOOKING_URL`. The function intentionally returns `booking_enabled: false` and the website shows the onboarding form instead. No fallback Odoo tenant is hard-coded into the browser.

## Netlify Forms

The visible and hidden static-detection forms share the `consultation` name and field names. The browser posts URL-encoded form data including `form-name=consultation`. Netlify must have Forms enabled for the site. Configure a notification destination in the Netlify dashboard and submit a real test lead after deployment.

The page reports an error if Netlify rejects the submission; it does not claim that an unsent lead was saved in localStorage.

## Build and test

```bash
npm install
npm test
npm run build
```

The Netlify build now runs the Node built-in test suite before publishing the static root directory.

## Security and scope

- No login form is presented as a working portal. The previous sign-in UI had no authentication backend and only displayed a fabricated success message.
- Booking URLs are supplied via the Netlify `BOOKING_URL` environment variable and must be HTTPS URLs without embedded credentials.
- No Odoo API token or administrator credential belongs in browser code.
- The public health function exposes deployment metadata only.
- The website does not provision Odoo, create bookings in Odoo or store customer data outside Netlify Forms.
