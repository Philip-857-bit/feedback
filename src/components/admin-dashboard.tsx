
"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, FileType, ChevronDown, XCircle, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { deleteFeedback } from "@/app/admin/actions";
import { useToast } from "@/hooks/use-toast";


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

type AdminDashboardProps = {
  feedback: Feedback[];
};

export function AdminDashboard({ feedback }: AdminDashboardProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (feedbackId: string) => {
    setIsDeleting(feedbackId);
    try {
      const result = await deleteFeedback(feedbackId);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: "Success!",
        description: "Feedback entry has been deleted.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(null);
    }
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Feedback Submissions", 20, 10);
    (doc as any).autoTable({
      head: [["User", "Rating", "Feedback", "Photo URL", "Consent", "Submitted"]],
      body: feedback.map(item => [
        `${item.is_anonymous ? "Anonymous" : item.name}\n${item.email}\n(${item.user_type})`,
        item.rating ? '⭐'.repeat(item.rating) : 'N/A',
        item.feedback,
        item.photo_url && item.photo_url.length > 0 ? Array.isArray(item.photo_url) ? item.photo_url.join(', ') : item.photo_url : 'N/A',
        item.consent ? 'Yes' : 'No',
        formatDate(item.created_at)
      ]),
      styles: {
        cellPadding: 2,
        fontSize: 8,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [28, 93, 57],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 40 },
        4: { cellWidth: 15 },
        5: { cellWidth: 25 },
      },
    });
    doc.save("feedback-submissions.pdf");
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "User Type", "Rating", "Feedback", "Photo URL", "Consent", "Anonymous", "Submitted At"];
    const rows = feedback.map(item => {
      const photoUrls = Array.isArray(item.photo_url) ? item.photo_url.join(',') : item.photo_url;
      return [
        item.id,
        item.is_anonymous ? "Anonymous" : `"${item.name}"`,
        item.email,
        item.user_type,
        item.rating ?? 'N/A',
        `"${item.feedback.replace(/"/g, '""')}"`,
        photoUrls ? `"${photoUrls}"` : '',
        item.consent,
        item.is_anonymous,
        formatDate(item.created_at)
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "feedback-submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const photos = feedback.flatMap(item => {
    if (!item.photo_url) {
      return [];
    }
    
    let urls: string[] = [];
    try {
      if (typeof item.photo_url === 'string' && item.photo_url.startsWith('[') && item.photo_url.endsWith(']')) {
         urls = JSON.parse(item.photo_url);
      } else if (Array.isArray(item.photo_url)) {
        urls = item.photo_url;
      } else if (typeof item.photo_url === 'string') {
        urls = [item.photo_url];
      }
    } catch (e) {
      console.error("Failed to parse photo_url:", item.photo_url, e);
      return [];
    }

    if (!Array.isArray(urls)) {
        return [];
    }

    return urls
      .filter(url => typeof url === 'string' && url.trim() !== '')
      .map(url => ({ ...item, photo_url_single: url }));
  });


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-headline">Feedback Entries</h2>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToPDF}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <span>Export to PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                    <FileType className="mr-2 h-4 w-4" />
                    <span>Export to CSV</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="border rounded-lg w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Consent</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {item.photo_url && item.photo_url.length > 0 && <AvatarImage src={Array.isArray(item.photo_url) ? item.photo_url[0] : item.photo_url} alt={item.name ?? 'User'} />}
                      <AvatarFallback>{item.name ? item.name.charAt(0).toUpperCase() : 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {item.is_anonymous ? "Anonymous" : item.name}
                      </div>
                      <div className="text-sm text-muted-foreground">{item.email}</div>
                      <Badge variant={item.user_type === 'brand' ? 'secondary' : 'default'} className="mt-1">
                        {item.user_type}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {item.rating ? (
                      [...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating! ? "text-primary" : "text-muted-foreground/30"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">N/A</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="truncate text-sm">{item.feedback}</p>
                </TableCell>
                <TableCell>
                  {item.consent ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-xs">
                  {formatDate(item.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isDeleting === item.id}>
                         {isDeleting === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the feedback entry from the server.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Photo Gallery</h2>
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((item, index) => (
              <Dialog key={`${item.id}-gallery-${index}`}>
                <DialogTrigger asChild>
                   <Card className="overflow-hidden cursor-pointer group">
                      <CardContent className="p-0">
                        <Image
                          src={item.photo_url_single}
                          alt={item.name ?? "Feedback photo"}
                          width={400}
                          height={400}
                          className="aspect-square object-cover w-full group-hover:scale-105 transition-transform duration-200"
                        />
                      </CardContent>
                      {!item.is_anonymous && (
                        <CardFooter className="p-2 text-xs">
                          <p className="truncate">{item.name}</p>
                        </CardFooter>
                      )}
                    </Card>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{item.is_anonymous ? 'Anonymous' : item.name}</DialogTitle>
                  </DialogHeader>
                  <div className="relative w-full aspect-video">
                    <Image
                      src={item.photo_url_single}
                      alt={item.name ?? "Feedback photo"}
                      fill
                      className="object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No photos have been submitted yet.</p>
        )}
      </div>
    </div>
  );
}
