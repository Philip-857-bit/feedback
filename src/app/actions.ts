
"use server";

import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

async function uploadPhoto(photo: File) {
  const supabase = createClient();
  const fileExt = photo.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from("feedback-photos")
    .upload(fileName, photo);

  if (error) {
    console.error("Error uploading photo:", error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from("feedback-photos")
    .getPublicUrl(fileName);

  return publicUrl;
}

async function sendConfirmationEmail(userEmail: string, name: string | null, isAnonymous: boolean) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: userEmail,
    subject: "Thank You for Your Feedback! | DeExclusives Music & Science Conference Festival",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Thank You For Your Feedback!</h2>
        <p>Dear ${isAnonymous ? 'Guest' : name},</p>
        <p>We've successfully received your feedback for the Music and Science Conference Festival 2025. We truly appreciate you taking the time to share your thoughts with us.</p>
        <p>Your input is invaluable in helping us make next year's event even more spectacular.</p>
        <p>Stay tuned for updates and highlights from this year's conference!</p>
        <br>
        <p>Best regards,</p>
        <p><strong>The DeExclusives Music Organization Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent to:", userEmail);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    // We don't want to block the user's feedback submission if the email fails,
    // so we'll just log the error and continue.
  }
}

export async function submitFeedback(formData: FormData) {
  const supabase = createClient();

  const rawFormData = {
    userType: formData.get('userType'),
    name: formData.get('name'),
    anonymous: formData.get('anonymous') === 'true',
    email: formData.get('email') as string,
    rating: formData.get('rating') ? Number(formData.get('rating')) : null,
    feedback: formData.get('feedback'),
    photos: formData.getAll('photo') as File[],
    consent: formData.get('consent') === 'true',
  };

  // Check if email already exists
  if (rawFormData.email && !rawFormData.anonymous) {
    const { data: existingFeedback, error: selectError } = await supabase
      .from('feedback')
      .select('id')
      .eq('email', rawFormData.email);

    if (selectError) {
      console.error("Error checking for existing email:", selectError);
      return { error: "An error occurred while checking for duplicates." };
    }

    if (existingFeedback && existingFeedback.length > 0) {
      return { error: "A feedback entry with this email address already exists." };
    }
  }


  let photoUrls: string[] = [];
  if (rawFormData.photos && rawFormData.photos.length > 0) {
    const uploadPromises = rawFormData.photos.map(photo => {
      if (photo.size > 0) {
        return uploadPhoto(photo);
      }
      return Promise.resolve(null);
    });

    try {
      const results = await Promise.all(uploadPromises);
      photoUrls = results.filter((url): url is string => url !== null);
    } catch (error: any) {
      console.error("Photo upload error:", error);
      return { error: "Failed to process photos." };
    }
  }

  const { error } = await supabase.from("feedback").insert({
    user_type: rawFormData.userType,
    name: rawFormData.anonymous ? "Anonymous" : rawFormData.name,
    is_anonymous: rawFormData.anonymous,
    email: rawFormData.email,
    rating: rawFormData.rating,
    feedback: rawFormData.feedback,
    photo_url: photoUrls.length > 0 ? photoUrls : null,
    consent: rawFormData.consent,
  });

  if (error) {
    console.error("Submission error:", error);
    return { error: error.message || "An unexpected error occurred. Please try again." };
  }

  // Send confirmation email
  if (rawFormData.email) {
    await sendConfirmationEmail(rawFormData.email, rawFormData.name as string | null, rawFormData.anonymous);
  }

  return { error: null };
}
