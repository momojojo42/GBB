#!/usr/bin/env bash
# ============================================================================
# Gardens by the Bay 3D Treasure Hunt — Google Cloud Run Deployment Script
# Usage:
#   ./deploy-cloudrun.sh [GCP_PROJECT_ID] [REGION] [SERVICE_NAME]
# ============================================================================

set -euo pipefail

export PATH="/Users/momo/.gemini/antigravity/brain/ddb26328-933b-4d1c-af8a-de8ff0292832/scratch/sdk/google-cloud-sdk/bin:${PATH}"
if [[ -d "${HOME}/.config/gcloud" ]] && [[ -n "$(CLOUDSDK_CONFIG="${HOME}/.config/gcloud" gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null || true)" ]]; then
  export CLOUDSDK_CONFIG="${HOME}/.config/gcloud"
else
  export CLOUDSDK_CONFIG="/Users/momo/.gemini/antigravity/brain/ddb26328-933b-4d1c-af8a-de8ff0292832/scratch/gcloud_config"
fi

if [[ -z "$(gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null || true)" ]]; then
  echo "🔐 No active Google Cloud session found — opening browser to sign in..."
  gcloud auth login --brief
fi

PROJECT_ID="${1:-}"
REGION="${2:-asia-southeast1}"
SERVICE_NAME="${3:-gbb-treasure-hunt}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "🔍 Checking candidate Google Cloud projects for existing ${SERVICE_NAME} service..."
  for CAND in antigravity-zm gen-lang-client-0850184288 ai-483608 playio-497808 tech-501512 fest-499621 fest-497702 eureka-504402 playfest-504402; do
    if gcloud run services list --project="${CAND}" --region="${REGION}" --format="value(metadata.name)" 2>/dev/null | grep -q "${SERVICE_NAME}"; then
      PROJECT_ID="${CAND}"
      echo "✅ Found existing ${SERVICE_NAME} in project: ${PROJECT_ID}"
      break
    fi
  done
fi

if [[ -z "${PROJECT_ID}" ]]; then
  for CAND in antigravity-zm gen-lang-client-0850184288 ai-483608 playio-497808 tech-501512; do
    if gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project="${CAND}" --quiet 2>/dev/null; then
      PROJECT_ID="${CAND}"
      echo "✅ Selected project with Cloud Run & Cloud Build enabled: ${PROJECT_ID}"
      break
    fi
  done
fi

if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
  echo "❌ Error: Could not auto-select a Google Cloud Project with Cloud Run permissions."
  exit 1
fi
gcloud config set project "${PROJECT_ID}" >/dev/null 2>&1 || true

echo "🚀 Deploying ${SERVICE_NAME} to Google Cloud Run..."
echo "   • Project: ${PROJECT_ID}"
echo "   • Region:  ${REGION}"
echo "   • Mode:    Public (--allow-unauthenticated) + Session Affinity (WebSocket rooms)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/../1_App" 2>/dev/null && pwd || pwd)"

gcloud run deploy "${SERVICE_NAME}" \
  --quiet \
  --source "${APP_DIR}" \
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
