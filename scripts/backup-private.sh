#!/usr/bin/env bash
# Nightly encrypted backup of the PRIVATE notes only (finances, strategy, network, etc.)
# AES-256 via openssl; passphrase from a local file NOT in git. Backups stay 100% local.
set -euo pipefail

VAULT_PRIVATE="C:/Users/arthu/Documents/notes/content/private"
BACKUP_DIR="C:/Users/arthu/Documents/notes-private-backups"
PASS_FILE="C:/Users/arthu/AppData/Local/hermes/.notes-backup-pass"
KEEP=14

mkdir -p "$BACKUP_DIR"
[ -f "$PASS_FILE" ] || { echo "ERROR: passphrase file missing at $PASS_FILE" >&2; exit 1; }

STAMP="$(date +%Y-%m-%d_%H%M%S)"
OUT="$BACKUP_DIR/private-$STAMP.tar.gz.enc"

# tar can take MSYS paths; openssl needs native C:/ paths (used above).
tar -C "C:/Users/arthu/Documents/notes/content" -czf - "private" \
  | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt \
      -pass "file:$PASS_FILE" -out "$OUT"

echo "Wrote $OUT ($(du -h "$OUT" | cut -f1))"

ls -1t "$BACKUP_DIR"/private-*.tar.gz.enc 2>/dev/null | tail -n +$((KEEP+1)) | while read -r old; do
  rm -f "$old" && echo "pruned $(basename "$old")"
done

# Restore:
#   openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass "file:$PASS_FILE" -in FILE.enc | tar -xzf - -C TARGET_DIR
