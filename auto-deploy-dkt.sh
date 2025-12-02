#!/bin/bash
# Auto-deploy script for BFCM Wrapped Quick Site
# Usage: ./auto-deploy-dkt.sh "deployment message"
#
# IMPORTANT: This script will ALWAYS prompt for Y/N confirmation before overwriting
# a Quick site. Never auto-approve deployments to prevent accidental overwrites.

DEPLOY_MESSAGE=${1:-"BFCM Wrapped update"}
SUBDOMAIN="bfcm-wrapped"

echo "🚀 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    
    # Verify manifest.json matches expected subdomain
    MANIFEST_NAME=$(cat dist/public/manifest.json | grep -o '"name": "[^"]*"' | cut -d'"' -f4)
    if [ "$MANIFEST_NAME" != "$SUBDOMAIN" ]; then
        echo "❌ ERROR: Manifest name mismatch!"
        echo "   Expected: ${SUBDOMAIN}"
        echo "   Found: ${MANIFEST_NAME}"
        echo "   This could deploy to the wrong Quick site!"
        echo ""
        echo "   Please check:"
        echo "   - client/public/manifest.json should have \"name\": \"${SUBDOMAIN}\""
        echo "   - quick.config.js should have name: '${SUBDOMAIN}'"
        exit 1
    fi
    
    echo "✅ Manifest verification passed (name: ${MANIFEST_NAME})"
    echo ""
    echo "📦 Deploying to ${SUBDOMAIN}.quick.shopify.io..."
    echo "📝 Deploy message: ${DEPLOY_MESSAGE}"
    echo ""
    echo "⚠️  WARNING: This will overwrite the existing Quick site if it exists."
    echo "   Site: ${SUBDOMAIN}.quick.shopify.io"
    echo ""
    
    # Prompt for confirmation - DO NOT auto-approve
    read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled by user"
        exit 1
    fi
    
    # Deploy without auto-approving - let quick CLI handle the prompt
    quick deploy dist/public ${SUBDOMAIN}
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Visit: https://${SUBDOMAIN}.quick.shopify.io"
    else
        echo "❌ Deployment failed"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi

