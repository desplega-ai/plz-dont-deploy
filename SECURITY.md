# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### Please Do Not

- **Do not** open a public GitHub issue for security vulnerabilities
- **Do not** discuss the vulnerability publicly until it has been addressed
- **Do not** exploit the vulnerability beyond what is necessary to demonstrate it

### How to Report

1. **Email**: Send details to [YOUR-EMAIL@example.com] (replace with your actual contact email)
   - Use the subject line: "Security Vulnerability Report"
   - Include the word "SECURITY" in the subject

2. **Include in your report**:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if any)
   - Your name/handle (if you want to be credited)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Assessment**: We will assess the vulnerability and determine its severity
- **Updates**: We will keep you informed of our progress
- **Resolution**: We aim to address critical vulnerabilities within 7 days
- **Credit**: With your permission, we will credit you in the fix announcement

### Disclosure Policy

- We follow **coordinated disclosure**
- We will work with you to understand and fix the issue
- We will publicly disclose the vulnerability after a fix is released
- We may request that you delay public disclosure to give users time to update

## Security Best Practices

If you're deploying this application, please ensure you:

### Environment Variables

- **Never commit** `.env` files to version control
- Use strong, randomly generated secrets (especially `JWT_SECRET`)
- Rotate secrets regularly
- Use environment-specific configurations

### JWT Secret

```bash
# Generate a secure JWT secret (minimum 32 characters)
openssl rand -base64 32
```

### Database

- Use strong database passwords
- Enable SSL/TLS for database connections in production
- Regularly backup your database
- Keep PostgreSQL updated
- Use database connection pooling

### Email Service

- Verify your domain with Resend before production use
- Protect your Resend API key
- Monitor email sending for abuse

### Application Security

- Keep all dependencies updated
- Run `npm audit` regularly to check for vulnerabilities
- Enable HTTPS in production (handled automatically by Vercel/most hosts)
- Use secure cookies (automatic in production with our config)
- Implement rate limiting (see deployment docs)
- Monitor application logs for suspicious activity

### Production Deployment

- Set `NODE_ENV=production`
- Ensure all environment variables are properly set
- Use a trusted hosting provider (Vercel, Railway, etc.)
- Enable security headers
- Set up monitoring and alerting
- Regular security audits

### User Data

- This application stores financial transaction data
- Ensure compliance with data protection regulations (GDPR, etc.)
- Implement proper access controls
- Consider encryption at rest for sensitive data
- Have a data retention and deletion policy

## Known Security Considerations

### Authentication

- Passwords are hashed using bcrypt (10 rounds)
- JWTs are used for session management
- Tokens expire after 7 days
- Sessions are stored in the database

### Input Validation

- All API inputs are validated using Zod schemas
- Prisma ORM prevents SQL injection
- React prevents XSS by default

### Rate Limiting

- A rate limiting utility is available in `src/lib/rate-limit.ts`
- Currently uses in-memory storage (suitable for single-instance deployments)
- **For production multi-instance deployments**: Use Redis-based rate limiting or API Gateway solutions
- Apply to sensitive endpoints (auth, API routes) for protection against abuse

### File Uploads

- Currently not implemented
- If you add file uploads, validate file types and sizes

## Security Updates

We will publish security advisories for significant vulnerabilities in:
- GitHub Security Advisories
- Release notes
- README.md

## Bug Bounty

We currently do not offer a bug bounty program, but we greatly appreciate responsible disclosure and will credit researchers who report valid security issues.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Questions?

If you have questions about this security policy, please open a public issue labeled "security-question" (for non-vulnerability questions only).

Thank you for helping keep Finance Tracker and our users safe!
