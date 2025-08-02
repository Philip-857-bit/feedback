import { FeedbackForm } from '@/components/feedback-form';
import { Music, FlaskConical } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background py-12 px-4 sm:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center gap-4 justify-center">
            <Music className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            <p className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground font-headline">
              DeExclusives Music Organization
            </p>
            <FlaskConical className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>
          <h1 className="text-lg text-muted-foreground">
            Music and Science Conference Festival 2025
          </h1>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground font-headline">
            Event Feedback
          </h2>
          <p className="text-md text-muted-foreground max-w-xl mx-auto">
            We value your feedback! Please let us know about your experience to help us make next year's event even better.
          </p>
        </header>

        <FeedbackForm />

        <footer className="text-center text-sm text-muted-foreground pt-4">
          © {new Date().getFullYear()} DeExclusives Music Organization. All Rights Reserved.
        </footer>
      </div>
    </main>
  );
}
