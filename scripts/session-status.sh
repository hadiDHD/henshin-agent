#!/bin/bash

# scripts/session-status.sh <session-id>
# Prints status, latest rule version, whether positive Tier3 passed, pending consult

SESSION_ID=$1

if [ -z "$SESSION_ID" ]; then
    echo "Usage: $0 <session-id>"
    exit 1
fi

SESSION_DIR="sessions/$SESSION_ID"

if [ ! -d "$SESSION_DIR" ]; then
    echo "Error: Session directory $SESSION_DIR not found."
    exit 1
fi

echo "=== Session Status: $SESSION_ID ==="

# 1. Read session.json status
if [ -f "$SESSION_DIR/session.json" ]; then
    STATUS=$(grep -o '"status": *"[^"]*"' "$SESSION_DIR/session.json" | cut -d'"' -f4)
    echo "Overall Status: $STATUS"
else
    echo "Overall Status: UNKNOWN (session.json missing)"
fi

# 2. Latest Rule Version
LATEST_RULE=$(ls -v "$SESSION_DIR/rules/candidate-v"*.henshin 2>/dev/null | tail -n 1)
if [ -z "$LATEST_RULE" ]; then
    echo "Latest Rule: None"
else
    VERSION=$(basename "$LATEST_RULE" .henshin | sed 's/candidate-//')
    echo "Latest Rule: $VERSION ($(basename "$LATEST_RULE"))"
    
    # 3. Validation Status (Tier 3 Positive)
    T3_FILE="$SESSION_DIR/validation/tier3-$VERSION-positive.json"
    if [ -f "$T3_FILE" ]; then
        if grep -q '"applied": *true' "$T3_FILE"; then
            echo "Tier 3 Positive: PASSED"
        else
            echo "Tier 3 Positive: FAILED"
        fi
    else
        echo "Tier 3 Positive: NOT RUN"
    fi
fi

# 4. Pending Consultations
PENDING_CONSULT=$(ls "$SESSION_DIR/intent/consult-"*.md 2>/dev/null | wc -l)
if [ "$PENDING_CONSULT" -gt 0 ]; then
    # Check if resolved-intent.md exists
    if [ -f "$SESSION_DIR/intent/resolved-intent.md" ]; then
         echo "Consultations: $PENDING_CONSULT (Resolved)"
    else
         echo "Consultations: $PENDING_CONSULT (Pending)"
    fi
else
    echo "Consultations: None"
fi

# 5. Evaluation Status
if [ -f "$SESSION_DIR/evaluation/decision.json" ]; then
    VERDICT=$(grep -o '"verdict": *"[^"]*"' "$SESSION_DIR/evaluation/decision.json" | cut -d'"' -f4)
    echo "Evaluation: $VERDICT"
else
    echo "Evaluation: Pending"
fi

echo "=================================="
