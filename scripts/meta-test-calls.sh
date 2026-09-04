#!/usr/bin/env bash
# Ejecuta las llamadas de prueba que Meta pide para el caso de uso
# "Connect with customers through WhatsApp" (App Review → API test calls).
#
# Cubre: whatsapp_business_messaging, whatsapp_business_management y business_management.
# Todas son de LECTURA: no envían mensajes ni modifican nada.
#
# Uso:
#   export META_TOKEN='EAAG...'          # token permanente del usuario del sistema
#   export META_PHONE_ID='123456789'     # WhatsApp → API Setup → Phone number ID
#   export META_WABA_ID='987654321'      # WhatsApp → API Setup → WhatsApp Business Account ID
#   scripts/meta-test-calls.sh
set -u

API="https://graph.facebook.com/v21.0"
TOKEN="${META_TOKEN:-}"
PHONE_ID="${META_PHONE_ID:-}"
WABA_ID="${META_WABA_ID:-}"

if [ -z "$TOKEN" ] || [ -z "$PHONE_ID" ] || [ -z "$WABA_ID" ]; then
  echo "Faltan datos. Exporta META_TOKEN, META_PHONE_ID y META_WABA_ID antes de correr el script."
  exit 1
fi

ok=0; fail=0

# $1 = permiso, $2 = descripción, $3 = path+query (sin el token)
call() {
  local perm="$1" desc="$2" path="$3"
  local sep="?"; case "$path" in *\?*) sep="&";; esac
  local body http
  body=$(curl -s -w $'\n%{http_code}' "${API}${path}${sep}access_token=${TOKEN}")
  http=$(printf '%s' "$body" | tail -n1)
  body=$(printf '%s' "$body" | sed '$d')
  if [ "$http" = "200" ]; then
    ok=$((ok+1))
    printf '  ✅ %-32s %s\n' "$perm" "$desc"
    printf '%s' "$body" | python3 -c 'import json,sys;d=json.load(sys.stdin);print("     →",json.dumps(d,ensure_ascii=False)[:180])' 2>/dev/null
  else
    fail=$((fail+1))
    printf '  ❌ %-32s %s (HTTP %s)\n' "$perm" "$desc" "$http"
    printf '%s' "$body" | python3 -c 'import json,sys;d=json.load(sys.stdin);e=d.get("error",{});print("     →",e.get("message","?"))' 2>/dev/null || echo "     → $body"
  fi
}

echo "Llamadas de prueba a la Graph API de Meta"
echo

echo "1) whatsapp_business_messaging"
call "whatsapp_business_messaging" "datos del número" "/${PHONE_ID}?fields=display_phone_number,verified_name,quality_rating"
call "whatsapp_business_messaging" "perfil del negocio" "/${PHONE_ID}/whatsapp_business_profile?fields=about,description,websites"
echo

echo "2) whatsapp_business_management"
call "whatsapp_business_management" "plantillas de mensaje" "/${WABA_ID}/message_templates?limit=1"
call "whatsapp_business_management" "números de la cuenta" "/${WABA_ID}/phone_numbers?limit=5"
echo

echo "3) business_management"
BIZ=$(curl -s "${API}/${WABA_ID}?fields=owner_business_info&access_token=${TOKEN}" \
  | python3 -c 'import json,sys;print(json.load(sys.stdin).get("owner_business_info",{}).get("id",""))' 2>/dev/null)
call "business_management" "cuenta de WhatsApp Business" "/${WABA_ID}?fields=id,name,owner_business_info"
if [ -n "$BIZ" ]; then
  call "business_management" "portafolio comercial" "/${BIZ}?fields=id,name,verification_status"
else
  echo "  ⚠️  No se pudo leer el business id desde la WABA (revisa que el token tenga business_management)."
fi

echo
echo "Resultado: ${ok} correctas, ${fail} con error."
echo "Recarga la pantalla de Meta en 2-3 minutos: los contadores deben pasar a 1 of 1."
