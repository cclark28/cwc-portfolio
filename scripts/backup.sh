#!/bin/bash
# CWC Portfolio Backup System
# Usage: ./scripts/backup.sh [save|restore|list]
# Run from the cwc root directory: cd ~/Documents/cwc && ./scripts/backup.sh save my-label

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$SCRIPT_DIR/.backups"
WEB_DIR="$SCRIPT_DIR/web"

case "$1" in
  save)
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    LABEL="${2:-snapshot}"
    DEST="$BACKUP_DIR/${TIMESTAMP}_${LABEL}"
    mkdir -p "$DEST"
    cp -r "$WEB_DIR/components" "$DEST/"
    cp -r "$WEB_DIR/app" "$DEST/"
    cp -r "$WEB_DIR/lib" "$DEST/"
    [ -d "$WEB_DIR/public" ] && cp -r "$WEB_DIR/public" "$DEST/"
    cp "$WEB_DIR/package.json" "$DEST/"
    [ -f "$WEB_DIR/next.config.ts" ] && cp "$WEB_DIR/next.config.ts" "$DEST/"
    [ -f "$WEB_DIR/next.config.js" ] && cp "$WEB_DIR/next.config.js" "$DEST/"
    echo "Saved backup: $DEST"
    ;;
  restore)
    if [ -z "$2" ]; then
      echo "Usage: ./scripts/backup.sh restore <backup_name>"
      echo "Run './scripts/backup.sh list' to see available backups"
      exit 1
    fi
    SRC="$BACKUP_DIR/$2"
    if [ ! -d "$SRC" ]; then
      echo "Backup not found: $SRC"
      exit 1
    fi
    EMERGENCY="$BACKUP_DIR/emergency_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$EMERGENCY"
    cp -r "$WEB_DIR/components" "$EMERGENCY/"
    cp -r "$WEB_DIR/app" "$EMERGENCY/"
    cp -r "$WEB_DIR/lib" "$EMERGENCY/"
    [ -d "$WEB_DIR/public" ] && cp -r "$WEB_DIR/public" "$EMERGENCY/"
    cp "$WEB_DIR/package.json" "$EMERGENCY/"
    echo "Emergency backup: $EMERGENCY"
    rm -rf "$WEB_DIR/components" "$WEB_DIR/app" "$WEB_DIR/lib"
    cp -r "$SRC/components" "$WEB_DIR/"
    cp -r "$SRC/app" "$WEB_DIR/"
    cp -r "$SRC/lib" "$WEB_DIR/"
    [ -d "$SRC/public" ] && cp -r "$SRC/public" "$WEB_DIR/"
    [ -f "$SRC/package.json" ] && cp "$SRC/package.json" "$WEB_DIR/"
    [ -f "$SRC/next.config.ts" ] && cp "$SRC/next.config.ts" "$WEB_DIR/"
    echo "Restored from: $SRC"
    ;;
  list)
    echo "Available backups:"
    ls -1t "$BACKUP_DIR" 2>/dev/null || echo "  (none)"
    ;;
  *)
    echo "CWC Backup System"
    echo "  ./scripts/backup.sh save [label]    - Save current state"
    echo "  ./scripts/backup.sh restore <name>  - Restore a backup (auto-saves emergency first)"
    echo "  ./scripts/backup.sh list            - List backups"
    ;;
esac
