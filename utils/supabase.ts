import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqbuuhgncdnfgoahzlcb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYnV1aGduY2RuZmdvYWh6bGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTg2MDUsImV4cCI6MjA3ODMzNDYwNX0.ob3NyvCPSldplWdLC_pFQXoxVI4Pf3lDId-9_sIDnhI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
