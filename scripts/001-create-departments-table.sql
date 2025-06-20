-- Create departments table
CREATE TABLE IF NOT EXISTS "Department" (
    "id" SERIAL PRIMARY KEY,
    "nom" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP NULL
);

-- Insert sample data
INSERT INTO "Department" ("nom") VALUES 
('Informatique'),
('Ressources Humaines'),
('Comptabilité'),
('Marketing'),
('Production'),
('Logistique')
ON CONFLICT DO NOTHING;
