-- Security Enhancement Tables
-- MFA/TOTP Support
CREATE TABLE IF NOT EXISTS user_mfa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  backup_codes_encrypted TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enabled_at TIMESTAMP WITH TIME ZONE,
  disabled_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id)
);

-- Security Event Logging
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_security_logs_user_id (user_id),
  INDEX idx_security_logs_event_type (event_type),
  INDEX idx_security_logs_severity (severity),
  INDEX idx_security_logs_timestamp (timestamp DESC),
  INDEX idx_security_logs_ip (ip_address)
);

-- IP Blocking System
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  UNIQUE(ip_address),
  INDEX idx_blocked_ips_ip (ip_address),
  INDEX idx_blocked_ips_expires (expires_at)
);

-- Failed Login Attempts Tracking
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip_address INET NOT NULL,
  success BOOLEAN DEFAULT FALSE,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  
  INDEX idx_login_attempts_email (email),
  INDEX idx_login_attempts_ip (ip_address),
  INDEX idx_login_attempts_attempted_at (attempted_at DESC)
);

-- Admin Activity Audit Log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_admin_audit_admin_id (admin_user_id),
  INDEX idx_admin_audit_action (action),
  INDEX idx_admin_audit_timestamp (timestamp DESC)
);

-- Sensitive Data Access Log
CREATE TABLE IF NOT EXISTS data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('READ', 'export', 'delete')),
  record_count INTEGER,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_data_access_user_id (user_id),
  INDEX idx_data_access_type (data_type),
  INDEX idx_data_access_timestamp (timestamp DESC)
);

-- RLS Policies for Security Tables
ALTER TABLE user_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;

-- MFA: Users can only access their own MFA data
CREATE POLICY "Users can manage their own MFA" ON user_mfa
  FOR ALL USING (auth.uid() = user_id);

-- Security logs: Admins and users can view their own logs
CREATE POLICY "Users can view their own security logs" ON security_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security logs" ON security_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Blocked IPs: Only admins can manage
CREATE POLICY "Only admins can manage blocked IPs" ON blocked_ips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Login attempts: Only admins can view
CREATE POLICY "Only admins can view login attempts" ON login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admin audit: Only super admins can view
CREATE POLICY "Only super admins can view admin audit" ON admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Data access: Users can view their own, admins can view all
CREATE POLICY "Users can view their own data access" ON data_access_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all data access" ON data_access_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Functions for automatic cleanup
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
  -- Delete security logs older than 1 year
  DELETE FROM security_logs 
  WHERE timestamp < NOW() - INTERVAL '1 year';
  
  -- Delete expired blocked IPs
  DELETE FROM blocked_ips 
  WHERE expires_at < NOW();
  
  -- Delete old login attempts (keep 90 days)
  DELETE FROM login_attempts 
  WHERE attempted_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-security-logs', '0 2 * * *', 'SELECT cleanup_old_security_logs();');