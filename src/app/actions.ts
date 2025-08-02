
"use server";

import { createClient } from "@/lib/supabase/server";

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

export async function submitFeedback(formData: FormData) {
  const supabase = createClient();

  const rawFormData = {
    userType: formData.get('userType'),
    name: formData.get('name'),
    anonymous: formData.get('anonymous') === 'true',
    email: formData.get('email'),
    rating: formData.get('rating') ? Number(formData.get('rating')) : null,
    feedback: formData.get('feedback'),
    photo: formData.get('photo') as File | null,
    consent: formData.get('consent') === 'true',
  };

  let photoUrl: string | null = null;
  if (rawFormData.photo && rawFormData.photo.size > 0) {
    try {
      photoUrl = await uploadPhoto(rawFormData.photo);
      if (!photoUrl) {
        return { error: "Photo upload failed." };
      }
    } catch (error: any) {
      console.error("Photo upload error:", error);
      return { error: "Failed to process photo." };
    }
  }

  const { error } = await supabase.from("feedback").insert({
    user_type: rawFormData.userType,
    name: rawFormData.anonymous ? "Anonymous" : rawFormData.name,
    is_anonymous: rawFormData.anonymous,
    email: rawFormData.email,
    rating: rawFormData.rating,
    feedback: rawFormData.feedback,
    photo_url: photoUrl,
    consent: rawFormData.consent,
  });

  if (error) {
    console.error("Submission error:", error);
    return { error: error.message || "An unexpected error occurred. Please try again." };
  }

  return { error: null };
}
