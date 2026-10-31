'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/domain';

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Validates hackathon password criteria:
 * - Length > 8
 * - Uppercase letter
 * - Lowercase letter
 * - Special character
 */
export async function validatePasswordRules(password: string): Promise<{ valid: boolean; error?: string }> {
  if (password.length <= 8) {
    return { valid: false, error: 'Password must be longer than 8 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character.' };
  }
  return { valid: true };
}

/**
 * Sign in action
 */
export async function signInAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // If Supabase not yet configured, provide demo route response
  if (!supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project-id')) {
    if (email.includes('admin')) {
      redirect('/dashboard');
    } else if (email.includes('staff')) {
      redirect('/staff/dashboard');
    } else {
      redirect('/portal');
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Invalid login credentials.' };
  }

  // Get user profile to determine role-based destination
  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('role')
    .eq('id', data.user.id)
    .single();

  const role: UserRole = profile?.role || 'customer';

  if (role === 'admin') {
    redirect('/dashboard');
  } else if (role === 'staff') {
    redirect('/staff/dashboard');
  } else {
    redirect('/portal');
  }
}

/**
 * Customer Self-Registration Action
 * Strictly assigns 'customer' role. Public users CANNOT elevate themselves to staff or admin.
 */
export async function registerCustomerAction(formData: FormData): Promise<AuthResponse> {
  const fullName = formData.get('fullName') as string;
  const companyName = formData.get('companyName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!fullName || !email || !password) {
    return { success: false, error: 'Full name, email, and password are required.' };
  }

  const passCheck = await validatePasswordRules(password);
  if (!passCheck.valid) {
    return { success: false, error: passCheck.error };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project-id')) {
    redirect('/portal');
  }

  const supabase = await createClient();

  // Create customer business record first
  const customerCode = `CUST-${companyName ? companyName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() : 'USER'}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const { data: customerRecord, error: custError } = await (supabase
    .from('customers') as any)
    .insert({
      customer_code: customerCode,
      name: companyName || fullName,
      email: email.trim().toLowerCase(),
    })
    .select('id')
    .single();

  if (custError || !customerRecord) {
    return { success: false, error: `Customer creation failed: ${custError?.message || 'Unknown error'}` };
  }

  // Sign up user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'customer',
        customer_id: customerRecord.id,
      },
    },
  });

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || 'Registration failed.' };
  }

  redirect('/portal');
}

/**
 * Sign out action
 */
export async function signOutAction() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('your-project-id')) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect('/login');
}

/**
 * Admin-only: Create Staff Member
 * Requires active session with role = 'admin'.
 */
export async function createStaffAction(fullName: string, email: string): Promise<AuthResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized.' };
  }

  const { data: callerProfile } = await (supabase
    .from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single();

  if ((callerProfile as any)?.role !== 'admin') {
    return { success: false, error: 'Forbidden: Only Admin can create staff accounts.' };
  }

  const adminClient = createAdminClient();
  const tempPassword = `BrightLoop@Staff${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'staff',
    },
  });

  if (createError) {
    return { success: false, error: createError.message };
  }

  // Create staff profile
  await adminClient.from('profiles').insert({
    id: newUser.user.id,
    full_name: fullName,
    email,
    role: 'staff',
  });

  return { success: true, message: `Staff member created with temporary password: ${tempPassword}` };
}
