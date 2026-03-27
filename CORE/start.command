#!/bin/bash
cd "$(dirname "$0")"
pnpm dev &
sleep 3
open http://localhost:3000
wait
