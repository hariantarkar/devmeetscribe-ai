# Accounts and login (JWT)

Every meeting, task and chat now belongs to the signed-in user. Nobody can read another user's data.

## 1. Add the dependencies to `backend/pom.xml`

Paste these inside `<dependencies>` (for example just above `</dependencies>`), then right-click the
project in STS: **Maven > Update Project...** (tick Force Update).

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

## 2. Optional: keep logins across backend restarts

Without a secret, the backend creates a temporary one at startup, so everyone signs in again after each restart.
To keep sessions, set a secret of at least 32 characters, either as an environment variable:

```
APP_JWT_SECRET=put-a-long-random-string-here-at-least-32-chars
```

or in `application.yml`:

```yaml
app:
  jwt:
    secret: ${APP_JWT_SECRET:}
    expiration-minutes: 1440   # 24 hours
```

Never commit a real secret to GitHub.

## 3. Meetings created before accounts

The database gets a new `owner_id` column on `meetings`. Older meetings have no owner, so nobody sees them.
Register your account first, then give the old meetings to it (your first user has id 1):

```sql
UPDATE meetings SET owner_id = 1 WHERE owner_id IS NULL;
```

## How it works

- `POST /api/auth/register` and `POST /api/auth/login` return a signed token. Passwords are stored as BCrypt hashes.
- The frontend sends `Authorization: Bearer <token>` on every request.
- `/api/health` and the Swagger pages stay public. Everything else needs a valid token (otherwise HTTP 401).
- The token is kept in the browser's localStorage, which is fine for a learning project. A production app
  would usually use an httpOnly cookie.
