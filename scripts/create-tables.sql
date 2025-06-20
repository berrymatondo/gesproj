-- Create the departments table
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enum type for status
DO $$ BEGIN
    CREATE TYPE "DepartmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the status column to use the enum
ALTER TABLE departments 
ALTER COLUMN status TYPE "DepartmentStatus" 
USING status::"DepartmentStatus";
