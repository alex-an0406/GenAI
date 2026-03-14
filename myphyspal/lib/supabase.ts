import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://yfzrcmjdepzozagargfn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmenJjbWpkZXB6b3phZ2FyZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDkxOTAsImV4cCI6MjA4OTA4NTE5MH0.1EDGSiwXniemv4A39M4SmK73275PBtO16mRAZdYiixM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});