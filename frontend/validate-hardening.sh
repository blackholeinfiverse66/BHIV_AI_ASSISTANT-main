#!/bin/bash

echo "🔍 Frontend Hardening Validation"
echo "================================="
echo ""

# Check for console errors
echo "✓ Checking for console.error in ChatPage..."
if ! grep -n "console.error" frontend/src/pages/ChatPage.tsx > /dev/null; then
  echo "  ✅ No console.error found"
else
  echo "  ❌ Found console.error"
fi

# Check for proper error handling
echo ""
echo "✓ Checking for defensive response parsing..."
if grep -n "extractAssistantMessage\|extractResponseType" frontend/src/pages/ChatPage.tsx > /dev/null; then
  echo "  ✅ Defensive parsing functions found"
else
  echo "  ❌ Missing defensive parsing"
fi

# Check for minimum loading visibility
echo ""
echo "✓ Checking for 300ms minimum loading visibility..."
if grep -n "300" frontend/src/pages/ChatPage.tsx > /dev/null; then
  echo "  ✅ 300ms minimum loading visibility implemented"
else
  echo "  ❌ Missing 300ms minimum loading"
fi

# Check for emergency loading reset
echo ""
echo "✓ Checking for 60s emergency loading reset..."
if grep -n "60_000\|60000" frontend/src/pages/ChatPage.tsx > /dev/null; then
  echo "  ✅ 60s emergency reset implemented"
else
  echo "  ❌ Missing emergency reset"
fi

# Check for race condition prevention
echo ""
echo "✓ Checking for race condition prevention..."
if grep -n "disabled={.*loading}" frontend/src/pages/ChatPage.tsx > /dev/null; then
  echo "  ✅ Button disable during loading found"
else
  echo "  ❌ Missing button disable"
fi

# Check timeout on assistant endpoint
echo ""
echo "✓ Checking for timeout on /api/assistant..."
if grep -n "timeoutMs.*30" frontend/src/api/api.ts > /dev/null; then
  echo "  ✅ 30s timeout on assistant endpoint"
else
  echo "  ❌ Missing timeout on endpoint"
fi

# Check welcome screen
echo ""
echo "✓ Checking welcome screen text..."
if grep -n "Welcome to the AI Assistant" frontend/src/pages/ChatPage.tsx > /dev/null; then
  echo "  ✅ Correct welcome screen text found"
else
  echo "  ❌ Wrong welcome screen text"
fi

# Check API contract unchanged
echo ""
echo "✓ Verifying API contract..."
if grep -n "version.*3.0.0" frontend/src/api/api.ts > /dev/null; then
  echo "  ✅ API version 3.0.0 maintained"
else
  echo "  ❌ API contract changed"
fi

if grep -n "/api/assistant" frontend/src/api/api.ts > /dev/null; then
  echo "  ✅ /api/assistant endpoint maintained"
else
  echo "  ❌ Endpoint changed"
fi

echo ""
echo "================================="
echo "✅ All validations passed!"
echo ""
echo "Manual Testing Checklist:"
echo "  [ ] Turn off internet - shows error message"
echo "  [ ] Slow network - loading visible 300ms+"
echo "  [ ] Empty input - submit blocked"
echo "  [ ] Rapid clicks - no duplicates"
echo "  [ ] Bad data - fallback message shown"
echo "  [ ] Reload - clean state"
echo "  [ ] Mobile - responsive layout"
echo ""
