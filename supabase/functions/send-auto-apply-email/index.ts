// Supabase Edge Function: Send Auto-Apply Email via AWS SES
// Sends job application email with CV (PDF attachment) and Cover Letter (HTML body)
// Phase 3: AWS SES Integration

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SESClient, SendRawEmailCommand } from "https://esm.sh/@aws-sdk/client-ses@3.490.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  userId: string;
  jobId: string;
  applicationId: string; // job_applications.id
  recipientEmail: string; // Job application email
  cvPDFBase64: string; // Base64 encoded PDF
  coverLetterHTML: string; // HTML email body
  coverLetterSubject: string; // Email subject
  jobTitle?: string; // For email context
  companyName?: string; // For email context
}

// AWS SES Email Sending
interface SESEmailParams {
  from: string;
  to: string;
  subject: string;
  htmlBody: string;
  pdfAttachment?: {
    filename: string;
    content: string; // Base64 encoded
    contentType: string;
  };
}

// Initialize AWS SES Client
function createSESClient() {
  const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
  const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  const region = Deno.env.get('AWS_SES_REGION') || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS SES credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
  }

  return new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

// Send email via AWS SES using SendRawEmail (supports attachments)
async function sendEmailViaSES(params: SESEmailParams): Promise<string> {
  const fromEmail = Deno.env.get('AWS_SES_FROM_EMAIL');
  if (!fromEmail) {
    throw new Error('AWS_SES_FROM_EMAIL environment variable not set');
  }

  // Use fromEmail if not provided in params
  const from = params.from || fromEmail;

  // Create MIME message
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const date = new Date().toUTCString();

  let rawMessage = `From: ${from}\r\n`;
  rawMessage += `To: ${params.to}\r\n`;
  rawMessage += `Subject: ${params.subject}\r\n`;
  rawMessage += `Date: ${date}\r\n`;
  rawMessage += `MIME-Version: 1.0\r\n`;
  rawMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n`;
  rawMessage += `\r\n`;

  // HTML body part
  rawMessage += `--${boundary}\r\n`;
  rawMessage += `Content-Type: text/html; charset=UTF-8\r\n`;
  rawMessage += `Content-Transfer-Encoding: 7bit\r\n`;
  rawMessage += `\r\n`;
  rawMessage += `${params.htmlBody}\r\n`;
  rawMessage += `\r\n`;

  // PDF attachment (if provided)
  if (params.pdfAttachment) {
    rawMessage += `--${boundary}\r\n`;
    rawMessage += `Content-Type: ${params.pdfAttachment.contentType}\r\n`;
    rawMessage += `Content-Disposition: attachment; filename="${params.pdfAttachment.filename}"\r\n`;
    rawMessage += `Content-Transfer-Encoding: base64\r\n`;
    rawMessage += `\r\n`;
    // Split base64 into 76-character lines (RFC 2045)
    const base64Content = params.pdfAttachment.content.match(/.{1,76}/g)?.join('\r\n') || params.pdfAttachment.content;
    rawMessage += `${base64Content}\r\n`;
    rawMessage += `\r\n`;
  }

  rawMessage += `--${boundary}--\r\n`;

  // Convert to Uint8Array for AWS SDK
  const rawMessageBytes = new TextEncoder().encode(rawMessage);

  // Create SES client and send email
  const sesClient = createSESClient();
  const command = new SendRawEmailCommand({
    Source: from,
    Destinations: [params.to],
    RawMessage: {
      Data: rawMessageBytes,
    },
  });

  try {
    const response = await sesClient.send(command);
    const messageId = response.MessageId;
    
    if (!messageId) {
      throw new Error('Failed to get message ID from AWS SES');
    }

    return messageId;
  } catch (error) {
    console.error('AWS SES Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`AWS SES error: ${errorMessage}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      userId,
      jobId,
      applicationId,
      recipientEmail,
      cvPDFBase64,
      coverLetterHTML,
      coverLetterSubject,
      jobTitle,
      companyName,
    }: RequestBody = await req.json();

    // Validate required fields
    if (!userId || !jobId || !applicationId || !recipientEmail || !cvPDFBase64 || !coverLetterHTML) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          required: ['userId', 'jobId', 'applicationId', 'recipientEmail', 'cvPDFBase64', 'coverLetterHTML'],
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Sending application email for user ${userId}, job ${jobId}`);

    // Prepare email
    const fromEmail = Deno.env.get('AWS_SES_FROM_EMAIL') || 'noreply@jobpilot.com';
    const subject = coverLetterSubject || `Application for ${jobTitle || 'Position'}`;
    
    // Create email HTML (cover letter is already HTML)
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${coverLetterHTML}
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #666; margin-top: 30px;">
    This email was sent via JobPilot Auto-Apply. Please find my CV attached.
  </p>
</body>
</html>`;

    // Send email via AWS SES with retry logic
    let sesMessageId: string | undefined;
    let emailError: Error | null = null;
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        sesMessageId = await sendEmailViaSES({
          from: fromEmail,
          to: recipientEmail,
          subject: subject,
          htmlBody: emailHTML,
          pdfAttachment: {
            filename: `CV_${jobTitle || 'Application'}_${Date.now()}.pdf`,
            content: cvPDFBase64,
            contentType: 'application/pdf',
          },
        });

        console.log(`✅ Email sent successfully. SES Message ID: ${sesMessageId}`);
        emailError = null;
        break; // Success, exit retry loop
      } catch (error) {
        emailError = error;
        retryCount++;
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Check if error is retryable
        const isRetryable = errorMessage.includes('timeout') || 
                           errorMessage.includes('network') ||
                           errorMessage.includes('rate limit') ||
                           (errorMessage.includes('5') && !errorMessage.includes('500')); // 5xx errors except 500

        if (!isRetryable || retryCount >= maxRetries) {
          // Not retryable or max retries reached
          break;
        }

        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        console.log(`⚠️ Email send failed (attempt ${retryCount}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (emailError || !sesMessageId) {
      const errorMsg = emailError instanceof Error ? emailError.message : 'Failed to send email after retries';
      console.error(`❌ Email sending failed after ${retryCount} attempts:`, errorMsg);

      // Update application record with error
      try {
        await supabase
          .from('job_applications')
          .update({
            application_status: 'failed',
            error_message: errorMsg,
            retry_count: retryCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId);
      } catch (updateError) {
        const updateErrorMsg = updateError instanceof Error ? updateError.message : String(updateError);
        console.error('Failed to update application record:', updateErrorMsg);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMsg,
          retryCount,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email sent successfully - update application record
    const { error: updateError } = await supabase
      .from('job_applications')
      .update({
        application_status: 'sent',
        ses_message_id: sesMessageId,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application record:', updateError);
      // Don't fail - email was sent successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: sesMessageId,
        sentAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fatal error in send-auto-apply-email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

