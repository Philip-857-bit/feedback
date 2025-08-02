"use client";

import jsPDF from "jspdf";
import "jspdf-autotable";
import { saveAs } from 'file-saver';
import { asBlob } from 'html-to-docx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, FileDown, FileText, FileType, ChevronDown } from "lucide-react";

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

type AdminDashboardProps = {
  feedback: Feedback[];
};

export function AdminDashboard({ feedback }: AdminDashboardProps) {
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
      head: [["User", "Rating", "Feedback", "Consent", "Submitted"]],
      body: feedback.map(item => [
        `${item.is_anonymous ? "Anonymous" : item.name}\n${item.email}\n(${item.user_type})`,
        item.rating ? '⭐'.repeat(item.rating) : 'N/A',
        item.feedback,
        item.consent ? 'Yes' : 'No',
        formatDate(item.created_at)
      ]),
      styles: {
        cellPadding: 2,
        fontSize: 8,
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
        3: { cellWidth: 15 },
        4: { cellWidth: 25 },
      },
    });
    doc.save("feedback-submissions.pdf");
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "User Type", "Rating", "Feedback", "Consent", "Anonymous", "Submitted At"];
    const rows = feedback.map(item => [
      item.id,
      item.is_anonymous ? "Anonymous" : `"${item.name}"`,
      item.email,
      item.user_type,
      item.rating ?? 'N/A',
      `"${item.feedback.replace(/"/g, '""')}"`,
      item.consent,
      item.is_anonymous,
      formatDate(item.created_at)
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "feedback-submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToWord = async () => {
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

    const docxBlob = await asBlob(htmlString, {
        orientation: 'landscape',
    });

    saveAs(docxBlob, 'feedback-submissions.docx');
  };

  return (
    <div className="space-y-4">
       <div className="flex justify-end">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Data
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export to PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                    <FileType className="mr-2 h-4 w-4" />
                    <span>Export to CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToWord}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export to Word</span>
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
              <TableHead className="text-right">Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {item.photo_url && <AvatarImage src={item.photo_url} alt={item.name ?? 'User'} />}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    