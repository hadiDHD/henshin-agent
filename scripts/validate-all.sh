#!/bin/bash
# 3-tier validation script for Henshin rules

HENSHIN_FILE=$1
ECORE_FILE=$2
XMI_FILE=$3
RULE_NAME=$4

if [ -z "$RULE_NAME" ]; then
  echo "Usage: $0 <henshin_file> <ecore_file> <xmi_file> <rule_name>"
  exit 1
fi

echo "--- Tier 1: Structural Validation ---"
node bin/validate.mjs --validate-structure "$HENSHIN_FILE" || exit 1

echo "--- Tier 2: Semantic Validation ---"
node bin/validate.mjs --validate-semantic "$HENSHIN_FILE" --metamodel "$ECORE_FILE" || exit 1

echo "--- Tier 3: Application Validation ---"
node bin/validate.mjs --apply "$HENSHIN_FILE" --metamodel "$ECORE_FILE" --model "$XMI_FILE" --rule "$RULE_NAME" || exit 1

echo "--- All Tiers Passed! ---"
