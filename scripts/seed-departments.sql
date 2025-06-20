-- Insert initial departments data
INSERT INTO departments (id, name, short_name, status, created_at, updated_at) VALUES
('dept-001', 'Ressources Humaines', 'RH', 'ACTIVE', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
('dept-002', 'Informatique', 'IT', 'ACTIVE', '2024-01-16T14:30:00Z', '2024-01-16T14:30:00Z'),
('dept-003', 'Comptabilité', 'COMPTA', 'ACTIVE', '2024-01-17T09:15:00Z', '2024-01-17T09:15:00Z'),
('dept-004', 'Marketing', 'MKT', 'INACTIVE', '2024-01-18T11:45:00Z', '2024-01-20T16:20:00Z'),
('dept-005', 'Ventes', 'SALES', 'DELETED', '2024-01-19T13:00:00Z', '2024-01-21T10:30:00Z')
ON CONFLICT (id) DO NOTHING;
