import { ToolType } from "./types";

export interface ExampleCase {
  title: string;
  badge: string;
  data: any;
}

export const EXAMPLES: Record<ToolType, ExampleCase[]> = {
  message: [
    {
      title: "Bank KYC & Account Block Threat",
      badge: "High Risk Phishing",
      data: {
        text: "Dear SBI User, your Netbanking account will be blocked by tonight due to incomplete KYC. Complete verification immediately to avoid penalty: http://bit.ly/sbi-kyc-update and share OTP with verification team.",
        channel: "sms",
      },
    },
    {
      title: "Work From Home Daily Task Scam",
      badge: "Advance-Fee Fraud",
      data: {
        text: "Part-time job vacancy! Work 1 hour daily from mobile and earn Rs 3000 to 8000. Just like YouTube videos and submit screenshot. Contact Telegram @VIP_Task_Manager to claim your 500 Rs joining bonus.",
        channel: "whatsapp",
      },
    },
    {
      title: "Legitimate Personal Message",
      badge: "Low Risk Clean",
      data: {
        text: "Hi Priya, sending you the presentation slides for tomorrow's team sync. Let me know if you want any edits before the 10am call.",
        channel: "whatsapp",
      },
    },
  ],
  website: [
    {
      title: "Punycode Homograph Mimic",
      badge: "Critical IDN Spoof",
      data: {
        url: "https://xn--pple-43d.com/login/auth-session",
      },
    },
    {
      title: "Direct IP Address Banking Host",
      badge: "High Risk IP Host",
      data: {
        url: "http://192.168.1.50/secure-banking/verify.php",
      },
    },
    {
      title: "UserInfo @ Deception Exploit",
      badge: "Critical Credential Obfuscation",
      data: {
        url: "https://google.com@phishing-defense-verify.xyz/account",
      },
    },
    {
      title: "Legitimate Domain",
      badge: "Clean Apex Domain",
      data: {
        url: "https://proofly.dev",
      },
    },
  ],
  email: [
    {
      title: "CEO Impersonation & Wire Redirection",
      badge: "Critical BEC Fraud",
      data: {
        sender: '"CEO David Evans" <david.evans@globaltech-holdings.com>',
        subject: "Urgent: Overdue vendor wire transfer instructions",
        headers: "From: david.evans@globaltech-holdings.com\nReply-To: executive-vault@offshore-pay.xyz\nAuthentication-Results: spf=fail; dkim=fail\nReceived-SPF: fail",
        text: "Hi Team,\n\nPlease process this overdue supplier invoice immediately. The vendor has changed their banking coordinates due to an annual audit. Remit $64,500 to the updated Swift account today before banking cutoff. Do not delay.\n\nRegards,\nDavid",
      },
    },
    {
      title: "Mailbox Storage Quota Harvest",
      badge: "High Risk Credential Phish",
      data: {
        sender: '"IT Support Helpdesk" <support@server-notify-auth.xyz>',
        subject: "Action Required: Mailbox 98% Full - Messages Delayed",
        headers: "From: support@server-notify-auth.xyz\nReply-To: support@server-notify-auth.xyz\nAuthentication-Results: spf=pass; dkim=neutral",
        text: "Your email storage is 98% full. Incoming messages are queued and will be deleted within 24 hours. Click below to verify password and expand storage quota: https://bit.ly/storage-quota-verify",
      },
    },
  ],
  phone: [
    {
      title: "Digital Arrest / CBI Narcotics Threat",
      badge: "Critical Police Impersonation",
      data: {
        phoneNumber: "+91 98200 44123",
        countryCode: "IN",
        claimedOrg: "CBI & Mumbai Cyber Cell",
        callDescription: "Caller claimed to be DCP Cyber Crime Cell Mumbai. They asserted my Aadhaar was found on an international contraband parcel containing narcotics seized at customs. They stated an arrest warrant was issued, instructed me to stay on Skype video for 'digital arrest', and threatened immediate police deployment if I hung up.",
      },
    },
    {
      title: "Debit Card Block & AnyDesk Remote Access",
      badge: "Critical Trojan Installation",
      data: {
        phoneNumber: "+91 22 4589 1000",
        countryCode: "IN",
        claimedOrg: "HDFC Credit Operations",
        callDescription: "Caller stated my debit card was blocked due to an unauthorized international transaction. They instructed me to install AnyDesk from the Play Store and read out the 9-digit code so they could 'remotely unfreeze' the account.",
      },
    },
    {
      title: "Unsolicited Telemarketing / Standard Number",
      badge: "Format Check Only",
      data: {
        phoneNumber: "+91 98123 45678",
        countryCode: "IN",
        claimedOrg: "",
        callDescription: "",
      },
    },
  ],
  payment: [
    {
      title: "UPI Transfer - Pending vs Completed",
      badge: "Status Ambiguity",
      data: {
        amount: "15,000",
        currency: "INR",
        notes: "Customer showed Google Pay screen with 'Processing' status claiming money was debited from their end.",
      },
    },
    {
      title: "High Value Transfer Slip (Missing UTR)",
      badge: "Missing Reference",
      data: {
        amount: "50,000",
        currency: "INR",
        notes: "Buyer sent a transaction receipt for goods, but the 12-digit UTR reference number is cut off at the bottom.",
      },
    },
  ],
  image: [
    {
      title: "90% Discount Luxury Goods Ad",
      badge: "Scam Advertisement",
      data: {
        context: "Social media ad claiming 90% discount clearance on Apple iPhone 16 Pro if ordered in 15 minutes through an unverified checkout link.",
      },
    },
    {
      title: "Bogus Government Subsidy Certificate",
      badge: "Impersonation Notice",
      data: {
        context: "WhatsApp image claiming RBI is distributing Rs 2,50,000 unclaimed funds to citizens who pay a 1,200 Rs documentation processing fee.",
      },
    },
  ],
};
