const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { createClient } = require('@supabase/supabase-js');

console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key prefix:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 12));

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

admin.auth.admin.createUser({
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  email_confirm: true,
})
  .then(r => console.log('RESULT:', JSON.stringify(r, null, 2)))
  .catch(e => console.log('THREW:', e));