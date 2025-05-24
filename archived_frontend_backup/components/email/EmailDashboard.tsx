'use client';

import { useState, useEffect } from 'react';
import { useEmails, useSummarizeEmail } from '@/hooks';
import { Email } from '@/api/emails';
import { Loader2, Mail, RefreshCw, Inbox, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSummaryPanel } from '@/components/email/EmailSummaryPanel';

export function EmailDashboard() {
  const { emails, loading, error, getEmails, markAsRead, markAsUnread } = useEmails();
  const { summary, loading: summarizing, generateSummary, clearSummary } = useSummarizeEmail();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch emails on component mount
  useEffect(() => {
    getEmails();
  }, [getEmails]);

  // Handle email selection
  const handleSelectEmail = async (email: Email) => {
    setSelectedEmail(email);
    clearSummary();
    
    // Mark as read if not already
    if (!email.isRead) {
      await markAsRead(email.id);
    }
  };

  // Handle email summarization
  const handleSummarizeEmail = async () => {
    if (!selectedEmail) return;
    
    await generateSummary({
      emailId: selectedEmail.id,
      emailBody: selectedEmail.body,
      emailSubject: selectedEmail.subject
    });
  };

  // Filter emails based on active tab
  const filteredEmails = emails.filter(email => {
    if (activeTab === 'unread') return !email.isRead;
    return true;
  });

  // Handle refresh
  const handleRefresh = () => {
    getEmails();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {/* Email List Panel */}
      <div className="md:col-span-1 border rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Inbox</h2>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="m-0">
            <EmailList 
              emails={filteredEmails} 
              selectedEmailId={selectedEmail?.id} 
              onSelectEmail={handleSelectEmail}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="m-0">
            <EmailList 
              emails={filteredEmails} 
              selectedEmailId={selectedEmail?.id} 
              onSelectEmail={handleSelectEmail}
              loading={loading}
              emptyMessage="No unread emails"
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Email Content Panel */}
      <div className="md:col-span-2 border rounded-lg overflow-hidden">
        {selectedEmail ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">{selectedEmail.subject}</h2>
                  <p className="text-sm text-muted-foreground">
                    From: {selectedEmail.sender.name} &lt;{selectedEmail.sender.email}&gt;
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedEmail.receivedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => selectedEmail.isRead ? markAsUnread(selectedEmail.id) : markAsRead(selectedEmail.id)}
                  >
                    {selectedEmail.isRead ? 'Mark as Unread' : 'Mark as Read'}
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleSummarizeEmail}
                    disabled={summarizing}
                  >
                    {summarizing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      'Summarize'
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="content">
                <div className="px-4 pt-2 border-b">
                  <TabsList>
                    <TabsTrigger value="content">Email Content</TabsTrigger>
                    <TabsTrigger value="summary" disabled={!summary}>Summary</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="content" className="p-4 h-full">
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="summary" className="p-4 h-full">
                  {summary ? (
                    <EmailSummaryPanel summary={summary} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-center">
                      <p className="text-muted-foreground">No summary available yet. Click &quot;Summarize&quot; to generate one.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-4">
            <Mail className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Select an email to view</h3>
            <p className="text-muted-foreground max-w-md">
              Choose an email from the list to view its content and generate AI summaries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Email List Component
interface EmailListProps {
  emails: Email[];
  selectedEmailId?: string;
  onSelectEmail: (email: Email) => void;
  loading: boolean;
  emptyMessage?: string;
}

function EmailList({ emails, selectedEmailId, onSelectEmail, loading, emptyMessage = "No emails found" }: EmailListProps) {
  if (loading && emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading emails...</p>
      </div>
    );
  }
  
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4">
        <Inbox className="h-8 w-8 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-1 p-2">
        {emails.map((email) => (
          <Card 
            key={email.id} 
            className={`cursor-pointer hover:bg-muted/50 transition-colors ${selectedEmailId === email.id ? 'bg-muted' : ''} ${!email.isRead ? 'border-l-4 border-l-primary' : ''}`}
            onClick={() => onSelectEmail(email)}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <div className={`flex-shrink-0 h-2 w-2 mt-2 rounded-full ${!email.isRead ? 'bg-primary' : 'bg-muted'}`} />
                <div className="overflow-hidden">
                  <div className="flex items-start justify-between">
                    <p className={`text-sm line-clamp-1 ${!email.isRead ? 'font-medium' : ''}`}>
                      {email.sender.name || email.sender.email}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(email.receivedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className={`text-sm line-clamp-1 mt-1 ${!email.isRead ? 'font-medium' : ''}`}>
                    {email.subject}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {email.snippet}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 