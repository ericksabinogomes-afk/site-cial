//const SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaWFvemZzcW1pbGpwZHhxd2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzI1MTAsImV4cCI6MjEwMTA0ODUxMH0.wkJ3_V5Mws9h7nB5WLeOflnbOWqTbX1VIDw9IfqNsJQ
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;