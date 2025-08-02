
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

  return { error: null };
}
