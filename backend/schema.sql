-- ============================================================================
-- VENDORBRIDGE ERP — COMPLETE POSTGRESQL SCHEMA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'procurement_officer', 'vendor', 'manager');

DROP TYPE IF EXISTS vendor_status CASCADE;
CREATE TYPE vendor_status AS ENUM ('active', 'inactive', 'pending', 'blacklisted');

DROP TYPE IF EXISTS rfq_status CASCADE;
CREATE TYPE rfq_status AS ENUM ('draft', 'sent', 'closed', 'cancelled', 'awarded');

DROP TYPE IF EXISTS quotation_status CASCADE;
CREATE TYPE quotation_status AS ENUM ('submitted', 'under_review', 'shortlisted', 'rejected', 'accepted', 'withdrawn');

DROP TYPE IF EXISTS approval_status CASCADE;
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'escalated');

DROP TYPE IF EXISTS approval_request_type CASCADE;
CREATE TYPE approval_request_type AS ENUM ('rfq', 'quotation', 'purchase_order');

DROP TYPE IF EXISTS po_status CASCADE;
CREATE TYPE po_status AS ENUM ('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'completed', 'cancelled');

DROP TYPE IF EXISTS invoice_status CASCADE;
CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'sent', 'paid', 'overdue', 'cancelled');

DROP TYPE IF EXISTS notification_type CASCADE;
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'approval_request', 'approval_decision', 'rfq_invite', 'quotation_received', 'po_issued', 'invoice_issued');

DROP TYPE IF EXISTS doc_type CASCADE;
CREATE TYPE doc_type AS ENUM ('gst_certificate', 'pan_card', 'registration_certificate', 'other');

-- ----------------------------------------------------------------------------
-- HELPER FUNCTION: auto-update updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE: users
-- ============================================================================
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL,
    vendor_id       UUID NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_vendor_id ON users(vendor_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email_active ON users(email, is_active);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: password_reset_tokens
-- ============================================================================
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
CREATE TABLE password_reset_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);

-- ============================================================================
-- TABLE: vendors
-- ============================================================================
DROP TABLE IF EXISTS vendors CASCADE;
CREATE TABLE vendors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    category            VARCHAR(100) NOT NULL,
    gst_number          VARCHAR(50) UNIQUE NULL,
    pan_number          VARCHAR(20) UNIQUE NULL,
    contact_person      VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(50) NOT NULL,
    website             VARCHAR(500) NULL,
    address_line1       VARCHAR(255) NULL,
    address_line2       VARCHAR(255) NULL,
    city                VARCHAR(100) NULL,
    state               VARCHAR(100) NULL,
    pincode             VARCHAR(20) NULL,
    country             VARCHAR(100) NOT NULL DEFAULT 'India',
    status              vendor_status NOT NULL DEFAULT 'active',
    rating              NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    total_orders        INTEGER NOT NULL DEFAULT 0,
    on_time_delivery_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    registered_by       UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_registered_by ON vendors(registered_by);
CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: vendor_documents
-- ============================================================================
DROP TABLE IF EXISTS vendor_documents CASCADE;
CREATE TABLE vendor_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    doc_type        doc_type NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    uploaded_by     UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendor_docs_vendor_id ON vendor_documents(vendor_id);

-- ============================================================================
-- TABLE: rfqs
-- ============================================================================
DROP TABLE IF EXISTS rfqs CASCADE;
CREATE TABLE rfqs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number      VARCHAR(50) NOT NULL UNIQUE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    deadline        TIMESTAMPTZ NOT NULL,
    status          rfq_status NOT NULL DEFAULT 'draft',
    terms           TEXT NULL,
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    sent_at         TIMESTAMPTZ NULL,
    closed_at       TIMESTAMPTZ NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_rfqs_number ON rfqs(rfq_number);
CREATE INDEX idx_rfqs_status_deadline ON rfqs(status, deadline);
CREATE INDEX idx_rfqs_created_by ON rfqs(created_by);
CREATE TRIGGER trg_rfqs_updated_at BEFORE UPDATE ON rfqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: rfq_items
-- ============================================================================
DROP TABLE IF EXISTS rfq_items CASCADE;
CREATE TABLE rfq_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id              UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    item_no             SMALLINT NOT NULL,
    product_name        VARCHAR(255) NOT NULL,
    description         TEXT NULL,
    quantity            NUMERIC(12,3) NOT NULL,
    unit                VARCHAR(50) NOT NULL DEFAULT 'units',
    estimated_unit_price NUMERIC(12,2) NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE UNIQUE INDEX idx_rfq_items_rfq_lineno ON rfq_items(rfq_id, item_no);

-- ============================================================================
-- TABLE: rfq_vendors (junction)
-- ============================================================================
DROP TABLE IF EXISTS rfq_vendors CASCADE;
CREATE TABLE rfq_vendors (
    rfq_id          UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    invited_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    invite_sent     BOOLEAN NOT NULL DEFAULT FALSE,
    responded       BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (rfq_id, vendor_id)
);

CREATE INDEX idx_rfq_vendors_vendor_id ON rfq_vendors(vendor_id);

-- ============================================================================
-- TABLE: quotations
-- ============================================================================
DROP TABLE IF EXISTS quotations CASCADE;
CREATE TABLE quotations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id              UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id           UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    total_amount        NUMERIC(12,2) NOT NULL,
    delivery_days       SMALLINT NOT NULL,
    validity_days       SMALLINT NOT NULL DEFAULT 30,
    notes               TEXT NULL,
    status              quotation_status NOT NULL DEFAULT 'submitted',
    submitted_by        UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    shortlisted_by      UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    shortlisted_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_quotations_rfq_status ON quotations(rfq_id, status);
CREATE INDEX idx_quotations_vendor_id ON quotations(vendor_id);
CREATE UNIQUE INDEX idx_quotations_rfq_vendor ON quotations(rfq_id, vendor_id);
CREATE TRIGGER trg_quotations_updated_at BEFORE UPDATE ON quotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: quotation_items
-- ============================================================================
DROP TABLE IF EXISTS quotation_items CASCADE;
CREATE TABLE quotation_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id    UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    rfq_item_id     UUID NOT NULL REFERENCES rfq_items(id) ON DELETE CASCADE,
    unit_price      NUMERIC(12,2) NOT NULL,
    quantity        NUMERIC(12,3) NOT NULL,
    line_total      NUMERIC(12,2) NOT NULL,
    delivery_days   SMALLINT NULL,
    notes           TEXT NULL
);

CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE UNIQUE INDEX idx_quotation_items_quotation_rfq_item ON quotation_items(quotation_id, rfq_item_id);

-- ============================================================================
-- TABLE: approval_requests
-- ============================================================================
DROP TABLE IF EXISTS approval_requests CASCADE;
CREATE TABLE approval_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type    approval_request_type NOT NULL,
    entity_id       UUID NOT NULL,
    requester_id    UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    status          approval_status NOT NULL DEFAULT 'pending',
    remarks         TEXT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ NULL
);

CREATE INDEX idx_approval_req_type_entity ON approval_requests(request_type, entity_id);
CREATE INDEX idx_approval_req_status ON approval_requests(status);

-- ============================================================================
-- TABLE: approval_steps
-- ============================================================================
DROP TABLE IF EXISTS approval_steps CASCADE;
CREATE TABLE approval_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    step_order      SMALLINT NOT NULL DEFAULT 1,
    approver_id     UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action          approval_status NOT NULL DEFAULT 'pending',
    remarks         TEXT NULL,
    decided_at      TIMESTAMPTZ NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approval_steps_request_id ON approval_steps(request_id);
CREATE INDEX idx_approval_steps_approver_action ON approval_steps(approver_id, action);

-- ============================================================================
-- TABLE: purchase_orders
-- ============================================================================
DROP TABLE IF EXISTS purchase_orders CASCADE;
CREATE TABLE purchase_orders (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number               VARCHAR(50) NOT NULL UNIQUE,
    quotation_id            UUID NOT NULL UNIQUE REFERENCES quotations(id) ON DELETE RESTRICT,
    vendor_id               UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    status                  po_status NOT NULL DEFAULT 'draft',
    subtotal                NUMERIC(12,2) NOT NULL,
    discount_amount         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_rate                NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    tax_amount              NUMERIC(12,2) NOT NULL,
    total_amount            NUMERIC(12,2) NOT NULL,
    delivery_address        TEXT NULL,
    expected_delivery_date  DATE NULL,
    terms_conditions        TEXT NULL,
    created_by              UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    sent_at                 TIMESTAMPTZ NULL,
    acknowledged_at         TIMESTAMPTZ NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_vendor_status ON purchase_orders(vendor_id, status);
CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: purchase_order_items
-- ============================================================================
DROP TABLE IF EXISTS purchase_order_items CASCADE;
CREATE TABLE purchase_order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id           UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    rfq_item_id     UUID NOT NULL REFERENCES rfq_items(id) ON DELETE SET NULL,
    product_name    VARCHAR(255) NOT NULL,
    quantity        NUMERIC(12,3) NOT NULL,
    unit            VARCHAR(50) NOT NULL,
    unit_price      NUMERIC(12,2) NOT NULL,
    line_total      NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_po_items_po_id ON purchase_order_items(po_id);

-- ============================================================================
-- TABLE: invoices
-- ============================================================================
DROP TABLE IF EXISTS invoices CASCADE;
CREATE TABLE invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number      VARCHAR(50) NOT NULL UNIQUE,
    po_id               UUID NOT NULL UNIQUE REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    vendor_id           UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    subtotal            NUMERIC(12,2) NOT NULL,
    tax_amount          NUMERIC(12,2) NOT NULL,
    total               NUMERIC(12,2) NOT NULL,
    status              invoice_status NOT NULL DEFAULT 'draft',
    due_date            DATE NULL,
    pdf_url             VARCHAR(500) NULL,
    emailed_to          VARCHAR(255) NULL,
    emailed_at          TIMESTAMPTZ NULL,
    paid_at             TIMESTAMPTZ NULL,
    created_by          UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status_due ON invoices(status, due_date);
CREATE INDEX idx_invoices_vendor_id ON invoices(vendor_id);
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: activity_logs
-- ============================================================================
DROP TABLE IF EXISTS activity_logs CASCADE;
CREATE TABLE activity_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID NOT NULL,
    details         JSONB NULL,
    ip_address      INET NULL,
    user_agent      VARCHAR(500) NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_user_created ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- TABLE: notifications
-- ============================================================================
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            notification_type NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    entity_type     VARCHAR(50) NULL,
    entity_id       UUID NULL,
    entity_url      VARCHAR(500) NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user_read_created ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notif_user_type ON notifications(user_id, type);

-- Add foreign key constraint to users table for vendor_id
ALTER TABLE users ADD CONSTRAINT fk_users_vendor_id FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL;
