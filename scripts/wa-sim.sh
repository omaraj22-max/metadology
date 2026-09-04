#!/usr/bin/env bash
# Simula un mensaje entrante de WhatsApp contra el webhook local.
# Uso: scripts/wa-sim.sh "<texto>" [telefono]
TEXT="${1:-hola}"
PHONE="${2:-5213311234567}"
BASE="${BASE:-http://localhost:4995}"
MSGID="wamid.$(date +%s%N)"
curl -s -X POST "$BASE/api/whatsapp/webhook" -H "Content-Type: application/json" -d @- <<JSON
{"object":"whatsapp_business_account","entry":[{"id":"1","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"phone_number_id":"x"},"contacts":[{"profile":{"name":"Omar Prueba"},"wa_id":"$PHONE"}],"messages":[{"from":"$PHONE","id":"$MSGID","timestamp":"$(date +%s)","type":"text","text":{"body":$(printf '%s' "$TEXT" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')}}]},"field":"messages"}]}]}
JSON
echo
