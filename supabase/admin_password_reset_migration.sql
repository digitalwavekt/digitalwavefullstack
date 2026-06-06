-- Add OTP columns to admins table for password reset functionality
-- This migration adds the ability to store temporary OTP and expiration time for admin password resets

ALTER TABLE admins
ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(6),
ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;

-- Create index for OTP lookups
CREATE INDEX IF NOT EXISTS idx_admins_reset_otp ON admins(reset_otp);

-- Add comment for documentation
COMMENT ON COLUMN admins.reset_otp IS 'Temporary 6-digit OTP for password reset via email';
COMMENT ON COLUMN admins.otp_expires_at IS 'Expiration timestamp for OTP (typically 10 minutes)';
