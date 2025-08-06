# SSL Certificates for EventIO

This directory contains SSL certificates for HTTPS connection.

## Required Files

-   `fullchain.pem`: The full certificate chain including any intermediate certificates
-   `privkey.pem`: The private key for the SSL certificate

## Generating Self-Signed Certificates for Development

For development purposes, you can generate self-signed certificates using OpenSSL:

```bash
# Generate a private key
openssl genrsa -out privkey.pem 2048

# Generate a self-signed certificate (valid for 365 days)
openssl req -new -x509 -key privkey.pem -out fullchain.pem -days 365 -subj "/CN=localhost"
```

## Production Certificates

For production, use certificates from a trusted Certificate Authority like Let's Encrypt.

**Note:** SSL certificates are excluded from version control. You need to manually add your certificates to this directory.
