import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase Client with the Service Role Key for Admin tasks
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req: any, res: any) {
  // We expect a custom header or simply rely on the fact that only admins should call this
  // In a real prod app, you should verify the JWT of the caller here to ensure they are an ADMIN
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Admin API not configured on server.' });
  }

  if (req.method === 'POST') {
    // CREATE NEW USER
    const { email, password, name, role, location, phone } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role,
          location,
          phone
        }
      });

      if (error) throw error;
      return res.status(200).json({ user: data.user });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }

  } else if (req.method === 'PUT') {
    // UPDATE PASSWORD
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'Missing userId or newPassword' });
    }

    try {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) throw error;
      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }

  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
