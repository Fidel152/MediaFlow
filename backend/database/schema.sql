-- ==========================================================================
-- MediaFlow - PostgreSQL Database Schema
-- Compatible with PostgreSQL 13+ and Supabase / Cloud SQL / RDS
-- ==========================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (prepared for multi-user and licensing)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    device_id VARCHAR(128) UNIQUE,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Licenses table (license key validation & tiers)
CREATE TABLE IF NOT EXISTS licenses (
    id VARCHAR(64) PRIMARY KEY,
    license_key VARCHAR(64) UNIQUE NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    tier VARCHAR(32) DEFAULT 'pro', -- 'free', 'pro', 'enterprise'
    max_concurrent INTEGER DEFAULT 5,
    valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year')
);

-- 3. Downloads table (tracking historical and active download requests)
CREATE TABLE IF NOT EXISTS downloads (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(500) NOT NULL,
    thumbnail TEXT,
    format VARCHAR(16) NOT NULL, -- 'mp4', 'mp3', 'm4a', 'webm'
    quality VARCHAR(32) NOT NULL, -- '1080p', '720p', '480p', '320kbps'
    media_type VARCHAR(16) NOT NULL DEFAULT 'video', -- 'video', 'audio'
    status VARCHAR(32) NOT NULL DEFAULT 'completed', -- 'pending', 'downloading', 'completed', 'failed', 'cancelled'
    file_name VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    file_size_formatted VARCHAR(32) DEFAULT '0 MB',
    saved_path TEXT,
    source_platform VARCHAR(64) DEFAULT 'direct',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Settings table (device/user customized preferences)
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(16) DEFAULT 'system',
    storage_path TEXT DEFAULT '/storage/emulated/0/Download/MediaFlow',
    wifi_only BOOLEAN DEFAULT FALSE,
    notify_on_complete BOOLEAN DEFAULT TRUE,
    max_concurrent_downloads INTEGER DEFAULT 3,
    preferred_quality VARCHAR(16) DEFAULT '720p',
    language VARCHAR(8) DEFAULT 'fr',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high performance queries
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
