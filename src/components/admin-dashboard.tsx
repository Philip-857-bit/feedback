"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle } from "lucide-react";

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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
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
  );
}
