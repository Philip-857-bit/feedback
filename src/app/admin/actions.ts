
"use server";

import * as fs from 'fs';
import { default as htmlToDocx } from 'html-to-docx';
import { createClient } from '@/lib/supabase/server';

type Feedback = {
  id: string;
  created_at: string;
  user_type: string;
  name: string | null;
  email: string;
  rating: number | null;
  feedback: string;
  photo_url: string[] | null;
  consent: boolean;
  is_anonymous: boolean;
};


const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
};

export async function exportToWord(feedback: Feedback[]) {
  const feedbackHtml = feedback.map(item => {
    const photosHtml = item.photo_url ? item.photo_url.map(url => `<img src="${url}" width="200" />`).join('<br/>') : 'N/A';
    return `
      <div>
        <h3>Feedback from ${item.is_anonymous ? "Anonymous" : item.name} (${item.email})</h3>
        <p><strong>User Type:</strong> ${item.user_type}</p>
        <p><strong>Submitted:</strong> ${formatDate(item.created_at)}</p>
        <p><strong>Rating:</strong> ${item.rating ? '⭐'.repeat(item.rating) : 'N/A'}</p>
        <p><strong>Feedback:</strong> ${item.feedback}</p>
        <p><strong>Consent:</strong> ${item.consent ? 'Yes' : 'No'}</p>
        <div><strong>Photos:</strong><br/> ${photosHtml}</div>
        <br/><hr/><br/>
      </div>
    `;
  }).join('');

  const fileBuffer = await htmlToDocx(
    `<!DOCTYPE html><html><head><title>Feedback</title></head><body>${feedbackHtml}</body></html>`,
    null,
    {
      image: {
        fetch: {
          concurrency: 5,
        },
      },
    }
  );

  return (fileBuffer as Buffer).toString('base64');
}
