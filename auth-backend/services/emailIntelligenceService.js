class EmailIntelligenceService {
  constructor() {
    // Email category patterns
    this.categoryPatterns = {
      promotions: {
        keywords: ['sale', 'discount', 'offer', 'deal', 'promo', 'coupon', '% off', 'limited time', 'black friday', 'cyber monday', 'flash sale'],
        senders: ['marketing@', 'offers@', 'deals@', 'promo@', 'sales@'],
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '🛍️'
      },
      receipts: {
        keywords: ['receipt', 'invoice', 'payment', 'order confirmation', 'purchase', 'billing', 'subscription', 'charged', 'transaction'],
        senders: ['noreply@', 'billing@', 'payments@', 'orders@'],
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '🧾'
      },
      events: {
        keywords: ['meeting', 'calendar', 'event', 'conference', 'webinar', 'appointment', 'scheduled', 'zoom', 'teams'],
        senders: ['calendar@', 'events@', 'meetings@'],
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '📅'
      },
      travel: {
        keywords: ['flight', 'hotel', 'booking', 'reservation', 'itinerary', 'check-in', 'boarding pass', 'travel', 'trip'],
        senders: ['booking.com', 'expedia', 'airlines', 'hotel'],
        color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        icon: '✈️'
      },
      actionRequired: {
        keywords: ['urgent', 'action required', 'please', 'deadline', 'due', 'respond', 'confirm', 'approval', 'review'],
        senders: [],
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '🔔'
      },
      personal: {
        keywords: [],
        senders: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'],
        color: 'bg-pink-100 text-pink-800 border-pink-200',
        icon: '💝'
      },
      updates: {
        keywords: ['newsletter', 'update', 'news', 'announcement', 'release', 'changelog', 'version'],
        senders: ['updates@', 'news@', 'newsletter@'],
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '📰'
      }
    };

    // Sentiment patterns
    this.sentimentPatterns = {
      urgent: {
        keywords: ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'deadline', 'overdue'],
        color: 'bg-red-500 text-white',
        icon: '🔴'
      },
      complaint: {
        keywords: ['complaint', 'issue', 'problem', 'error', 'bug', 'frustrated', 'disappointed'],
        color: 'bg-orange-500 text-white',
        icon: '😡'
      },
      opportunity: {
        keywords: ['opportunity', 'proposal', 'collaboration', 'partnership', 'investment'],
        color: 'bg-green-500 text-white',
        icon: '💡'
      },
      friendly: {
        keywords: ['thanks', 'thank you', 'appreciate', 'great', 'awesome', 'congratulations'],
        color: 'bg-blue-500 text-white',
        icon: '🟢'
      }
    };

    // Action patterns
    this.actionPatterns = {
      calendar: {
        patterns: [
          /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
          /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
          /(meeting|appointment|call|conference)/gi
        ],
        action: 'Add to Calendar',
        icon: '📅'
      },
      reminder: {
        patterns: [
          /(due|deadline|by|before).{0,20}(\d{1,2}[\/\-]\d{1,2})/gi,
          /(remind|follow up|check back)/gi
        ],
        action: 'Set Reminder',
        icon: '⏰'
      },
      receipt: {
        patterns: [
          /(receipt|invoice|billing|order)/gi,
          /(\$\d+|\d+\.\d{2})/g
        ],
        action: 'Save Receipt',
        icon: '🧾'
      },
      unsubscribe: {
        patterns: [
          /(unsubscribe|opt.out|remove)/gi
        ],
        action: 'Unsubscribe',
        icon: '🛑'
      },
      reply: {
        patterns: [
          /(question|reply|respond|answer)/gi,
          /(\?)/g
        ],
        action: 'Quick Reply',
        icon: '💬'
      }
    };
  }

  /**
   * Categorize an email based on content and sender
   * @param {Object} email - Email object with subject, content, sender
   * @returns {Object} Category information
   */
  categorizeEmail(email) {
    const content = `${email.subject || ''} ${email.content || ''}`.toLowerCase();
    const sender = (email.sender || '').toLowerCase();

    for (const [categoryName, category] of Object.entries(this.categoryPatterns)) {
      // Check keywords
      const hasKeyword = category.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );

      // Check sender patterns
      const hasSenderPattern = category.senders.some(pattern => 
        sender.includes(pattern.toLowerCase())
      );

      if (hasKeyword || hasSenderPattern) {
        return {
          name: categoryName,
          label: this.formatCategoryLabel(categoryName),
          color: category.color,
          icon: category.icon
        };
      }
    }

    // Default category
    return {
      name: 'general',
      label: 'General',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '📧'
    };
  }

  /**
   * Analyze sentiment and urgency of an email
   * @param {Object} email - Email object
   * @returns {Array} Array of sentiment tags
   */
  analyzeSentiment(email) {
    const content = `${email.subject || ''} ${email.content || ''}`.toLowerCase();
    const tags = [];

    for (const [sentimentName, sentiment] of Object.entries(this.sentimentPatterns)) {
      const hasPattern = sentiment.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );

      if (hasPattern) {
        tags.push({
          name: sentimentName,
          label: this.formatSentimentLabel(sentimentName),
          color: sentiment.color,
          icon: sentiment.icon
        });
      }
    }

    return tags;
  }

  /**
   * Detect possible actions for an email
   * @param {Object} email - Email object
   * @returns {Array} Array of suggested actions
   */
  detectActions(email) {
    const content = `${email.subject || ''} ${email.content || ''}`;
    const actions = [];

    for (const [actionName, actionData] of Object.entries(this.actionPatterns)) {
      const hasPattern = actionData.patterns.some(pattern => 
        pattern.test(content)
      );

      if (hasPattern) {
        actions.push({
          type: actionName,
          action: actionData.action,
          icon: actionData.icon,
          confidence: this.calculateActionConfidence(content, actionData.patterns)
        });
      }
    }

    // Sort by confidence and return top 3
    return actions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  /**
   * Extract tasks and to-dos from email content
   * @param {Object} email - Email object
   * @returns {Array} Array of detected tasks
   */
  extractTasks(email) {
    const content = email.content || '';
    const tasks = [];

    // Pattern for task detection
    const taskPatterns = [
      /please\s+(.*?)(?:\.|$)/gi,
      /you\s+need\s+to\s+(.*?)(?:\.|$)/gi,
      /can\s+you\s+(.*?)(?:\.|$)/gi,
      /don't\s+forget\s+to\s+(.*?)(?:\.|$)/gi,
      /make\s+sure\s+to\s+(.*?)(?:\.|$)/gi,
      /remember\s+to\s+(.*?)(?:\.|$)/gi
    ];

    // Date extraction for deadlines
    const datePatterns = [
      /by\s+(\w+\s+\d{1,2})/gi,
      /due\s+(\w+\s+\d{1,2})/gi,
      /before\s+(\w+\s+\d{1,2})/gi,
      /deadline\s+(\w+\s+\d{1,2})/gi
    ];

    taskPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const taskText = match[1].trim();
        if (taskText.length > 5 && taskText.length < 100) {
          // Look for associated deadline
          let deadline = null;
          datePatterns.forEach(datePattern => {
            const dateMatch = datePattern.exec(content);
            if (dateMatch) {
              deadline = dateMatch[1];
            }
          });

          tasks.push({
            text: taskText,
            deadline: deadline,
            priority: this.calculateTaskPriority(taskText, deadline),
            source: 'ai_extraction'
          });
        }
      }
    });

    return tasks.slice(0, 3); // Return top 3 tasks
  }

  /**
   * Generate thread summary for related emails
   * @param {Array} emails - Array of related emails
   * @returns {Object} Thread summary
   */
  generateThreadSummary(emails) {
    if (emails.length <= 1) return null;

    const summary = {
      emailCount: emails.length,
      participants: [...new Set(emails.map(e => e.sender))],
      timeSpan: this.calculateTimeSpan(emails),
      keyTopics: this.extractKeyTopics(emails),
      lastActivity: emails[0].timestamp,
      summary: this.generateThreadText(emails)
    };

    return summary;
  }

  /**
   * Helper methods
   */
  formatCategoryLabel(category) {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
  }

  formatSentimentLabel(sentiment) {
    return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
  }

  calculateActionConfidence(content, patterns) {
    let matches = 0;
    patterns.forEach(pattern => {
      const patternMatches = (content.match(pattern) || []).length;
      matches += patternMatches;
    });
    return Math.min(matches * 0.3, 1.0);
  }

  calculateTaskPriority(taskText, deadline) {
    const urgentWords = ['urgent', 'asap', 'immediately', 'critical'];
    const hasUrgentWords = urgentWords.some(word => 
      taskText.toLowerCase().includes(word)
    );
    
    if (hasUrgentWords) return 'high';
    if (deadline) return 'medium';
    return 'low';
  }

  calculateTimeSpan(emails) {
    if (emails.length < 2) return null;
    const first = new Date(emails[emails.length - 1].timestamp);
    const last = new Date(emails[0].timestamp);
    const diffDays = Math.ceil((last - first) / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }

  extractKeyTopics(emails) {
    // Simple keyword extraction
    const allText = emails.map(e => `${e.subject} ${e.content}`).join(' ').toLowerCase();
    const words = allText.split(/\s+/);
    const wordCount = {};
    
    words.forEach(word => {
      if (word.length > 4 && !this.isStopWord(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);
  }

  generateThreadText(emails) {
    const latest = emails[0];
    const count = emails.length;
    const participants = [...new Set(emails.map(e => e.sender))];
    
    return `Thread with ${count} emails between ${participants.join(', ')}. Latest: ${latest.subject}`;
  }

  isStopWord(word) {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those'];
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * Comprehensive email analysis
   * @param {Object} email - Email object
   * @param {Array} relatedEmails - Related emails for thread analysis
   * @returns {Object} Complete email intelligence
   */
  analyzeEmail(email, relatedEmails = []) {
    return {
      category: this.categorizeEmail(email),
      sentiment: this.analyzeSentiment(email),
      actions: this.detectActions(email),
      tasks: this.extractTasks(email),
      thread: this.generateThreadSummary([email, ...relatedEmails])
    };
  }
}

module.exports = new EmailIntelligenceService(); 