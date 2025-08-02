import { AdminDashboard } from '@/components/admin-dashboard';
import { createClient } from '@/lib/supabase/server';
import { Database } from 'lucide-react';

async function getFeedback() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }

  return data;
}

export default async function AdminPage() {
  const feedbackData = await getFeedback();

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background py-8 sm:py-12 px-4 sm:px-8">
      <div className="w-full max-w-7xl space-y-6 sm:space-y-8">
        <header className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 sm:gap-4 justify-center">
             <Database className="h-8 w-8 text-primary" />
           </div>
           <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-headline">
             Admin Dashboard
           </h1>
           <p className="text-sm sm:text-md text-muted-foreground max-w-xl mx-auto">
             Viewing all feedback submissions from the database.
           </p>
        </header>
        
        <AdminDashboard feedback={feedbackData} />
        
        <footer className="text-center text-xs sm:text-sm text-muted-foreground pt-4">
          © {new Date().getFullYear()} DeExclusives Music Organization. All Rights Reserved.
        </footer>
      </div>
    </main>
  );
}
