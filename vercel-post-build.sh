#!/bin/bash

# Deployment post-build hook for Vercel
# Automatically resets vouchers to 1/6 - 30/6 after deployment.
# Spin period ends 15/6; voucher can still be used until 30/6.
# Run: vercel env pull && sh vercel-post-build.sh

set -e

echo "🚀 Post-deployment: Resetting vouchers (hạn dùng voucher: 1/6 - 30/6, hạn chót quay: 15/6)..."

# Check if DEPLOYMENT_URL exists
if [ -z "$VERCEL_ENV" ]; then
  echo "⚠️  VERCEL_ENV not set, skipping auto-reset"
  exit 0
fi

# Determine the correct URL based on environment
if [ "$VERCEL_ENV" = "production" ]; then
  DOMAIN=$VERCEL_PROJECT_PRODUCTION_URL
elif [ "$VERCEL_ENV" = "preview" ]; then
  DOMAIN=$VERCEL_URL
else
  DOMAIN="localhost:3000"
fi

if [ -z "$DOMAIN" ]; then
  DOMAIN="localhost:3000"
fi

echo "📍 Using domain: $DOMAIN"
echo "🔐 Using admin key: ${ADMIN_SECRET_KEY:0:10}..."

# Call reset API
RESPONSE=$(curl -s -X POST "https://$DOMAIN/api/admin/reset-vouchers?key=$ADMIN_SECRET_KEY" \
  -H "Content-Type: application/json")

echo "📋 API Response:"
echo "$RESPONSE"

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Vouchers auto-reset successful!"
  exit 0
else
  echo "⚠️  Reset may have failed, check logs"
  exit 0  # Don't fail deployment
fi
