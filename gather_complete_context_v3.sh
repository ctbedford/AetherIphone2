#!/bin/bash
# … keep header …

usage(){ cat <<EOF
Usage: $0 [-q] [-s MAX_KB]
  -q   Quick mode (diff since merge-base of HEAD vs origin/main)
  -s   Max inline size in KiB (default: 512)
EOF
exit 1; }

MAX_INLINE_SIZE=$((512*1024))
while getopts ":qs:h" flag; do
  case $flag in
    q) QUICK_MODE=true ;;
    s) MAX_INLINE_SIZE=$(($OPTARG*1024)) ;;
    h) usage ;;
  esac
done
shift $((OPTIND-1))

# 1️⃣  File list -------------------------------------------------------------
if git rev-parse --is-inside-work-tree &>/dev/null; then
  if $QUICK_MODE; then
    base=$(git merge-base HEAD origin/main 2>/dev/null || git rev-parse --short HEAD~1)
    mapfile -t tracked < <(git diff --name-only "$base"..HEAD)  # Ensure variables are quoted
  else
    mapfile -t tracked < <(git ls-files)
  fi
  mapfile -t untracked < <(git ls-files --others --exclude-standard)
  FILES=( "${tracked[@]}" "${untracked[@]}" )
else
  mapfile -t FILES < <(find . -type f ! -path "./node_modules/*")
fi
