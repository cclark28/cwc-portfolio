#!/bin/bash
# CWC Portfolio Backup System — Full Project Backup
# Usage: ./scripts/backup.sh [save|restore|list]
# Run from the cwc root directory: cd ~/Documents/cwc && ./scripts/backup.sh save

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$SCRIPT_DIR/.backups"
WEB_DIR="$SCRIPT_DIR/web"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

case "$1" in
  save)
    DEST="$BACKUP_DIR/${TIMESTAMP}"
    mkdir -p "$DEST/web" "$DEST/schemaTypes"

    # Web directory (the Next.js app)
    cp -r "$WEB_DIR/components" "$DEST/web/"
    cp -r "$WEB_DIR/app" "$DEST/web/"
    cp -r "$WEB_DIR/lib" "$DEST/web/"
    [ -d "$WEB_DIR/public" ] && cp -r "$WEB_DIR/public" "$DEST/web/"
    cp "$WEB_DIR/package.json" "$DEST/web/"
    [ -f "$WEB_DIR/next.config.ts" ] && cp "$WEB_DIR/next.config.ts" "$DEST/web/"
    [ -f "$WEB_DIR/next.config.js" ] && cp "$WEB_DIR/next.config.js" "$DEST/web/"
    [ -f "$WEB_DIR/tsconfig.json" ] && cp "$WEB_DIR/tsconfig.json" "$DEST/web/"
    [ -f "$WEB_DIR/postcss.config.mjs" ] && cp "$WEB_DIR/postcss.config.mjs" "$DEST/web/"
    [ -f "$WEB_DIR/eslint.config.mjs" ] && cp "$WEB_DIR/eslint.config.mjs" "$DEST/web/"
    [ -f "$WEB_DIR/vercel.json" ] && cp "$WEB_DIR/vercel.json" "$DEST/web/"
    [ -f "$WEB_DIR/.env.local" ] && cp "$WEB_DIR/.env.local" "$DEST/web/"

    # Sanity config + schemas (root level)
    [ -f "$SCRIPT_DIR/sanity.config.js" ] && cp "$SCRIPT_DIR/sanity.config.js" "$DEST/"
    [ -f "$SCRIPT_DIR/sanity.cli.js" ] && cp "$SCRIPT_DIR/sanity.cli.js" "$DEST/"
    cp -r "$SCRIPT_DIR/schemaTypes/"* "$DEST/schemaTypes/"
    [ -f "$SCRIPT_DIR/package.json" ] && cp "$SCRIPT_DIR/package.json" "$DEST/"
    [ -f "$SCRIPT_DIR/.gitignore" ] && cp "$SCRIPT_DIR/.gitignore" "$DEST/"
    [ -f "$SCRIPT_DIR/eslint.config.mjs" ] && cp "$SCRIPT_DIR/eslint.config.mjs" "$DEST/"

    echo "Full backup saved: $DEST"
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

    # Emergency backup of current state first
    EMERGENCY="$BACKUP_DIR/emergency_${TIMESTAMP}"
    mkdir -p "$EMERGENCY/web" "$EMERGENCY/schemaTypes"
    cp -r "$WEB_DIR/components" "$EMERGENCY/web/"
    cp -r "$WEB_DIR/app" "$EMERGENCY/web/"
    cp -r "$WEB_DIR/lib" "$EMERGENCY/web/"
    [ -d "$WEB_DIR/public" ] && cp -r "$WEB_DIR/public" "$EMERGENCY/web/"
    cp "$WEB_DIR/package.json" "$EMERGENCY/web/"
    [ -f "$WEB_DIR/next.config.ts" ] && cp "$WEB_DIR/next.config.ts" "$EMERGENCY/web/"
    [ -f "$WEB_DIR/tsconfig.json" ] && cp "$WEB_DIR/tsconfig.json" "$EMERGENCY/web/"
    [ -f "$WEB_DIR/.env.local" ] && cp "$WEB_DIR/.env.local" "$EMERGENCY/web/"
    [ -f "$SCRIPT_DIR/sanity.config.js" ] && cp "$SCRIPT_DIR/sanity.config.js" "$EMERGENCY/"
    [ -f "$SCRIPT_DIR/sanity.cli.js" ] && cp "$SCRIPT_DIR/sanity.cli.js" "$EMERGENCY/"
    cp -r "$SCRIPT_DIR/schemaTypes/"* "$EMERGENCY/schemaTypes/"
    [ -f "$SCRIPT_DIR/package.json" ] && cp "$SCRIPT_DIR/package.json" "$EMERGENCY/"
    echo "Emergency backup: $EMERGENCY"

    # Restore web files
    if [ -d "$SRC/web" ]; then
      # New full backup format
      rm -rf "$WEB_DIR/components" "$WEB_DIR/app" "$WEB_DIR/lib"
      cp -r "$SRC/web/components" "$WEB_DIR/"
      cp -r "$SRC/web/app" "$WEB_DIR/"
      cp -r "$SRC/web/lib" "$WEB_DIR/"
      [ -d "$SRC/web/public" ] && cp -r "$SRC/web/public" "$WEB_DIR/"
      [ -f "$SRC/web/package.json" ] && cp "$SRC/web/package.json" "$WEB_DIR/"
      [ -f "$SRC/web/next.config.ts" ] && cp "$SRC/web/next.config.ts" "$WEB_DIR/"
      [ -f "$SRC/web/tsconfig.json" ] && cp "$SRC/web/tsconfig.json" "$WEB_DIR/"
      [ -f "$SRC/web/postcss.config.mjs" ] && cp "$SRC/web/postcss.config.mjs" "$WEB_DIR/"
      [ -f "$SRC/web/eslint.config.mjs" ] && cp "$SRC/web/eslint.config.mjs" "$WEB_DIR/"
      [ -f "$SRC/web/vercel.json" ] && cp "$SRC/web/vercel.json" "$WEB_DIR/"
      [ -f "$SRC/web/.env.local" ] && cp "$SRC/web/.env.local" "$WEB_DIR/"
    else
      # Old backup format (files at root of backup)
      rm -rf "$WEB_DIR/components" "$WEB_DIR/app" "$WEB_DIR/lib"
      cp -r "$SRC/components" "$WEB_DIR/"
      cp -r "$SRC/app" "$WEB_DIR/"
      cp -r "$SRC/lib" "$WEB_DIR/"
      [ -d "$SRC/public" ] && cp -r "$SRC/public" "$WEB_DIR/"
      [ -f "$SRC/package.json" ] && cp "$SRC/package.json" "$WEB_DIR/"
      [ -f "$SRC/next.config.ts" ] && cp "$SRC/next.config.ts" "$WEB_DIR/"
    fi

    # Restore Sanity config + schemas (if present in backup)
    [ -f "$SRC/sanity.config.js" ] && cp "$SRC/sanity.config.js" "$SCRIPT_DIR/"
    [ -f "$SRC/sanity.cli.js" ] && cp "$SRC/sanity.cli.js" "$SCRIPT_DIR/"
    [ -d "$SRC/schemaTypes" ] && cp -r "$SRC/schemaTypes/"* "$SCRIPT_DIR/schemaTypes/"
    [ -f "$SRC/package.json" ] && cp "$SRC/package.json" "$SCRIPT_DIR/"

    echo "Restored from: $SRC"
    ;;
  list)
    echo "Available backups:"
    ls -1t "$BACKUP_DIR" 2>/dev/null || echo "  (none)"
    ;;
  *)
    echo "CWC Backup System"
    echo "  ./scripts/backup.sh save             - Full backup (date/time stamped)"
    echo "  ./scripts/backup.sh restore <name>   - Restore a backup (auto-saves emergency first)"
    echo "  ./scripts/backup.sh list             - List backups"
    ;;
esac
