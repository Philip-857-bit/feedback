
"use server";

import asBlob from 'html-to-docx';

type Feedback = {
  id: string;
  created_at: string;
  user_type: string;
  name: string | null;
  email: string;
  rating: number | null;
  feedback: string;
  photo_url: string | null;
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

export async function exportToWord(feedback: Feedback[]): Promise<string | null> {
    let htmlString = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Feedback Submissions</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Feedback Submissions</h1>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Consent</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
    `;
    feedback.forEach(item => {
      htmlString += `
        <tr>
          <td>
            ${item.is_anonymous ? 'Anonymous' : item.name}<br/>
            <small>${item.email}</small><br/>
            <small>(${item.user_type})</small>
          </td>
          <td>${item.rating ? '⭐'.repeat(item.rating) : 'N/A'}</td>
          <td>${item.feedback}</td>
          <td>${item.consent ? 'Yes' : 'No'}</td>
          <td>${formatDate(item.created_at)}</td>
        </tr>
      `;
    });
    htmlString += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const fileBuffer = await asBlob(htmlString, {
        orientation: 'landscape',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        return: 'buffer'
      });
  
      return (fileBuffer as Buffer).toString('base64');
    } catch (error) {
      console.error("Error generating Word document:", error);
      return null;
    }
  }
