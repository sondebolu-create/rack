#!/usr/bin/env bash
# Rebuild a scratch database from the migrations and run the RLS tests against it.
# Needs a local Postgres (brew install postgresql@17). No Docker needed.
#   DB_HOST/DB_PORT default to localhost:54999; the cluster must already be running.
set -euo pipefail
cd "$(dirname "$0")/../.."
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
H=${DB_HOST:-localhost}; PORT=${DB_PORT:-54999}; DB=rack_test
psql -h "$H" -p "$PORT" -U postgres -d postgres -q -c "drop database if exists $DB with (force)" -c "create database $DB"
# roles are cluster-wide, so recreate them each run
psql -h "$H" -p "$PORT" -U postgres -d postgres -q -c "drop role if exists anon" -c "drop role if exists authenticated" -c "drop role if exists service_role" 2>/dev/null || true
P() { psql -h "$H" -p "$PORT" -U postgres -d $DB -v ON_ERROR_STOP=1 -q -o /dev/null "$@"; }
P -f supabase/tests/00_supabase_shim.sql
for f in supabase/migrations/*.sql; do P -f "$f"; done
P -f supabase/tests/rls.test.sql
