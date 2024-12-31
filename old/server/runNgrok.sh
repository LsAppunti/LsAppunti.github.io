#!/bin/bash
ngrok http 3000 > /dev/null &

sleep 3
FORWARDING_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

echo "Ngrok Forwarding URL: $FORWARDING_URL"
