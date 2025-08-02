
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/star-rating";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Store,
  Mail,
  Image as ImageIcon,
  PartyPopper,
  Loader2,
  FileText,
  MessageCircle,
} from "lucide-react";

const formSchema = z.object({
  userType: z.enum(["attendee", "brand"], {
    required_error: "Please select your role.",
  }),
  name: z.string(),
  anonymous: z.boolean().default(false).optional(),
  email: z.string().email("Please enter a valid email address."),
  rating: z.number().min(0).max(5).optional(),
  feedback: z.string().min(10, {
    message: "Feedback must be at least 10 characters.",
  }),
  photo: z.custom<FileList>().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to our terms to submit feedback.",
  }),
}).refine(data => data.anonymous || (data.name && data.name.trim().length > 0), {
  message: "Name is required unless you are anonymous.",
  path: ["name"],
});

type FormValues = z.infer<typeof formSchema>;

export function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: undefined,
      name: "",
      anonymous: false,
      email: "",
      rating: 0,
      photo: undefined,
      feedback: "",
      consent: false,
    },
  });

  const { watch, setValue, trigger } = form;
  const isAnonymous = watch("anonymous");
  
  async function uploadPhoto(photo: File) {
    const fileExt = photo.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("feedback-photos")
      .upload(fileName, photo);

    if (error) {
      console.error("Error uploading photo:", error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("feedback-photos")
      .getPublicUrl(data.path);

    return publicUrl;
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    let photoUrl: string | null = null;

    try {
      if (values.photo && values.photo.length > 0) {
        photoUrl = await uploadPhoto(values.photo[0]);
        if (!photoUrl) {
           throw new Error("Photo upload failed.");
        }
      }

      const { error } = await supabase.from("feedback").insert({
        user_type: values.userType,
        name: values.anonymous ? "Anonymous" : values.name,
        is_anonymous: values.anonymous,
        email: values.email,
        rating: values.rating,
        feedback: values.feedback,
        photo_url: photoUrl,
        consent: values.consent,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "Your feedback has been submitted.",
      });

    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSuccess) {
    return (
      <Card className="w-full max-w-2xl shadow-lg animate-scale-in">
        <CardHeader className="items-center text-center p-8">
          <PartyPopper className="h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold font-headline">Thank You!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Your feedback has been submitted. We appreciate you! Stay connected and get the latest updates by joining our community.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-4 px-8 pb-8">
           <Button asChild className="w-full">
            <a href="https://chat.whatsapp.com/CsuHgAXGJ8eAtRdPGmLZ5S" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Join our Community
            </a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg animate-fade-in-up">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Share Your Experience</CardTitle>
        <CardDescription>
          Fill out the form below. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-semibold">I am an... *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="attendee" id="attendee" className="peer sr-only" />
                        </FormControl>
                        <Label
                          htmlFor="attendee"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer transition-colors"
                        >
                          <User className="mb-3 h-6 w-6" />
                          Attendee
                        </Label>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="brand" id="brand" className="peer sr-only" />
                        </FormControl>
                        <Label
                          htmlFor="brand"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer transition-colors"
                        >
                          <Store className="mb-3 h-6 w-6" />
                          Brand
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name {!isAnonymous && '*'}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Jane Doe" {...field} disabled={isAnonymous} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-2 -ml-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          const isChecked = !!checked;
                          field.onChange(isChecked);
                          if (isChecked) {
                            setValue('name', '');
                            trigger('name');
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I'd like to remain anonymous
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Rating (Optional)</FormLabel>
                  <FormControl>
                     <StarRating rating={field.value ?? 0} onRatingChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Feedback *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what you loved, what could be improved, or share a testimonial..."
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo"
              render={({ field: { onChange, ...rest }}) => (
                <FormItem>
                  <FormLabel>Upload a Photo (Optional)</FormLabel>
                  <FormControl>
                    <Label htmlFor="photo-upload" className="relative block w-full cursor-pointer rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-primary transition-colors">
                      <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                        <ImageIcon className="h-10 w-10"/>
                        {fileName ? (
                          <div className="flex items-center gap-2 text-foreground">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">{fileName}</span>
                          </div>
                        ) : (
                          <p>Click or drag to upload an image</p>
                        )}
                        <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
                      </div>
                      <Input
                        id="photo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(e.target.files);
                            setFileName(file.name);
                          }
                        }}
                        {...rest}
                      />
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Showcase Consent *
                    </FormLabel>
                    <FormDescription>
                      I consent to have my feedback (and photo, if provided) showcased publicly on DeExclusives' marketing materials.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : "Submit Feedback"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
