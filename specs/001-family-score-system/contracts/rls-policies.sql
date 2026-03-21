-- ============================================================
-- Row Level Security (RLS) Policies
-- Project: 儿童积分管理系统 (Family Score System)
-- Branch:  001-family-score-system
-- Date:    2026-03-20
--
-- Security model:
--   parent → can read all children data, write rules/records/children
--   child  → can only read own child's data (bound via profiles.child_id)
--   anon   → no access to any table
-- ============================================================

-- Helper function: get current user's role from profiles
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Helper function: get current user's bound child_id (for child role)
CREATE OR REPLACE FUNCTION auth_child_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT child_id FROM profiles WHERE user_id = auth.uid() AND role = 'child' LIMIT 1;
$$;

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules    ENABLE ROW LEVEL SECURITY;
ALTER TABLE records  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles
-- ============================================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (user_id = auth.uid());

-- Parents can read all profiles (for admin purposes)
CREATE POLICY "profiles_select_parent" ON profiles
  FOR SELECT USING (auth_role() = 'parent');

-- Only service_role (admin) can insert/update profiles
-- (no INSERT/UPDATE policies = only Supabase Admin API can write)

-- ============================================================
-- children
-- ============================================================

-- Parent can read all active and inactive children
CREATE POLICY "children_select_parent" ON children
  FOR SELECT USING (auth_role() = 'parent');

-- Child can only read their own child record
CREATE POLICY "children_select_child" ON children
  FOR SELECT USING (
    auth_role() = 'child' AND id = auth_child_id()
  );

-- Only parent can insert children
CREATE POLICY "children_insert_parent" ON children
  FOR INSERT WITH CHECK (auth_role() = 'parent');

-- Only parent can update children (e.g., hide/rename)
CREATE POLICY "children_update_parent" ON children
  FOR UPDATE USING (auth_role() = 'parent');

-- No DELETE policy: children are never physically deleted

-- ============================================================
-- rules
-- ============================================================

-- Both parent and child can read active rules
CREATE POLICY "rules_select_all" ON rules
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only parent can insert rules
CREATE POLICY "rules_insert_parent" ON rules
  FOR INSERT WITH CHECK (auth_role() = 'parent');

-- Only parent can update rules (name, score, is_active)
CREATE POLICY "rules_update_parent" ON rules
  FOR UPDATE USING (auth_role() = 'parent');

-- Only parent can delete rules
CREATE POLICY "rules_delete_parent" ON rules
  FOR DELETE USING (auth_role() = 'parent');

-- ============================================================
-- records (IMMUTABLE: no UPDATE or DELETE policies)
-- ============================================================

-- Parent can read all records
CREATE POLICY "records_select_parent" ON records
  FOR SELECT USING (auth_role() = 'parent');

-- Child can only read records for their bound child_id
CREATE POLICY "records_select_child" ON records
  FOR SELECT USING (
    auth_role() = 'child' AND child_id = auth_child_id()
  );

-- Only parent can insert records
CREATE POLICY "records_insert_parent" ON records
  FOR INSERT WITH CHECK (
    auth_role() = 'parent'
    -- Ensure score_snapshot matches the referenced rule's current score
    -- (enforced at application layer; DB constraint is the rule_id FK)
  );

-- NO UPDATE POLICY on records  → any UPDATE attempt returns 403
-- NO DELETE POLICY on records  → any DELETE attempt returns 403
-- This enforces immutability at the database layer.
