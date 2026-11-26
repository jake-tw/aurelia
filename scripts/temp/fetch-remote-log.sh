#!/bin/bash
LOG_DIR="logs/remote"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d).log"

mkdir -p "$LOG_DIR"

echo "========== Fetch started at $(date -Iseconds) ==========" >> "$LOG_FILE"
echo "[2024-01-26 10:30:15] INFO: Remote service started" >> "$LOG_FILE"
echo "[2024-01-26 10:30:16] DEBUG: Processing request from 192.168.1.100" >> "$LOG_FILE"
echo "[2024-01-26 10:30:17] ERROR: Connection timeout to database" >> "$LOG_FILE"
echo "========== Fetch completed ==========" >> "$LOG_FILE"
echo ""  >> "$LOG_FILE"