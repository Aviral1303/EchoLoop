'use client';

import { EmailSummary } from '@/api/emails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clipboard, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface EmailSummaryPanelProps {
  summary: EmailSummary;
}

export function EmailSummaryPanel({ summary }: EmailSummaryPanelProps) {
  const [copied, setCopied] = useState(false);

  // Copy summary to clipboard
  const handleCopy = () => {
    const keyPoints = summary.keyPoints.map(point => `• ${point}`).join('\n');
    const actionItems = summary.actionItems.map(item => `• ${item}`).join('\n');
    
    const textToCopy = `
Email Summary:

Key Points:
${keyPoints}

${summary.actionItems.length > 0 ? `Action Items:\n${actionItems}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Get sentiment icon and color
  const getSentimentDetails = () => {
    switch (summary.sentiment) {
      case 'positive':
        return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, label: 'Positive', color: 'text-green-500' };
      case 'negative':
        return { icon: <AlertCircle className="h-4 w-4 text-red-500" />, label: 'Negative', color: 'text-red-500' };
      default:
        return { icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />, label: 'Neutral', color: 'text-yellow-500' };
    }
  };

  const sentimentDetails = getSentimentDetails();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Generated on:</span>
          <span className="text-sm text-muted-foreground">
            {new Date(summary.generatedAt).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Sentiment:</span>
          <span className={`text-sm flex items-center space-x-1 ${sentimentDetails.color}`}>
            {sentimentDetails.icon}
            <span>{sentimentDetails.label}</span>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Clipboard className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Key Points</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {summary.actionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.actionItems.map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 