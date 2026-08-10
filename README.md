# Study Material — permanent approved video access

This build supports:
- Direct MP4 upload from the admin panel to private Supabase Storage
- UTR/manual payment approval
- Permanent entitlement through an approved purchase row
- Short-lived signed video URLs generated only for approved users
- Admin hide/show for videos

## Setup
1. Keep the `videos` bucket PRIVATE.
2. Run `schema.sql` in Supabase SQL Editor once.
3. Ensure your admin profile has role `admin`.
4. Deploy the website files to GitHub Pages.
5. Open `/admin.html` to upload MP4 videos.

Important:
- "Permanent access" means the approved purchase remains in the database until an admin changes its status or revokes it. The actual streaming URL is temporary and regenerated when the user watches.
- No client-side system can completely prevent screen recording or sharing of credentials.
- Never put a Supabase secret/service-role key in the client.
