# TODO - Session cookie 401 fix

- [x] Update backend cookie config so `SESSION_COOKIE_SECURE` is `true` in production (required for `SameSite=None` cookies).

- [ ] (After code change) re-test login and `/api/auth/status` and `/api/projects/` requests.

