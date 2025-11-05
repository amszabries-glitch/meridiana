-- Create payment schedule tables for projects: down payments (Anzahlungen) and deposits (Hinterlegungen)

DO $$ BEGIN
    -- Down payments table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'project_down_payments'
    ) THEN
        CREATE TABLE project_down_payments (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            idx smallint NOT NULL CHECK (idx >= 1 AND idx <= 5),
            amount numeric(15,2) NOT NULL DEFAULT 0,
            due_date date NULL,
            paid_at timestamptz NULL,
            notes text NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX project_down_payments_project_idx ON project_down_payments(project_id);
        CREATE UNIQUE INDEX project_down_payments_project_idx_unique ON project_down_payments(project_id, idx);
    END IF;

    -- Deposits table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'project_deposits'
    ) THEN
        CREATE TABLE project_deposits (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            idx smallint NOT NULL CHECK (idx >= 1 AND idx <= 3),
            amount numeric(15,2) NOT NULL DEFAULT 0,
            due_date date NULL,
            paid_at timestamptz NULL,
            notes text NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX project_deposits_project_idx ON project_deposits(project_id);
        CREATE UNIQUE INDEX project_deposits_project_idx_unique ON project_deposits(project_id, idx);
    END IF;
END $$;

-- Enable RLS and add shared-data policies (all authenticated users)
ALTER TABLE project_down_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_deposits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    -- Drop old permissive policies if any
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_authenticated_down_payments' AND tablename = 'project_down_payments'
    ) THEN
        DROP POLICY allow_all_authenticated_down_payments ON project_down_payments;
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_authenticated_deposits' AND tablename = 'project_deposits'
    ) THEN
        DROP POLICY allow_all_authenticated_deposits ON project_deposits;
    END IF;
END $$;

CREATE POLICY allow_all_authenticated_down_payments ON project_down_payments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY allow_all_authenticated_deposits ON project_deposits
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


