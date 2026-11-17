#!/usr/bin/env bash
# ============================================================================
# Gardens by the Bay 3D Treasure Hunt — Google Cloud Run Deployment Script
# Usage:
#   ./deploy-cloudrun.sh [GCP_PROJECT_ID] [REGION] [SERVICE_NAME]
# ============================================================================

set -euo pipefail

export PATH="/Users/momo/.gemini/antigravity/brain/ddb26328-933b-4d1c-af8a-de8ff0292832/scratch/sdk/google-cloud-sdk/bin:${PATH}"
export CLOUDSDK_CONFIG="/Users/momo/.gemini/antigravity/brain/ddb26328-933b-4d1c-af8a-de8ff0292832/scratch/gcloud_config"

PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null || true)}"
REGION="${2:-asia-southeast1}"
SERVICE_NAME="${3:-gbb-treasure-hunt}"

if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
  echo "❌ Error: No Google Cloud Project ID specified."
  echo "Usage: ./deploy-cloudrun.sh <YOUR_GCP_PROJECT_ID> [REGION] [SERVICE_NAME]"
  echo "Or set default project first: gcloud config set project <YOUR_GCP_PROJECT_ID>"
  exit 1
fi

echo "🚀 Deploying ${SERVICE_NAME} to Google Cloud Run..."
echo "   • Project: ${PROJECT_ID}"
echo "   • Region:  ${REGION}"
echo "   • Mode:    Public (--allow-unauthenticated) + Session Affinity (WebSocket rooms)"

gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --session-affinity \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1 \
  --timeout 3600

echo "✅ Deployment complete!"
