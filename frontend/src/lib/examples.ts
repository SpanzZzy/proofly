import { ToolType, AnalysisResponse } from "./types";

export interface ExampleCase {
  id: string;
  title: string;
  badge: string;
  data: any;
  predefinedResult: AnalysisResponse;
}

const DISCLAIMER = "This is an automated risk assessment designed for preliminary screening. It is not legal proof or a substitute for independent verification through official institutions.";

export const EXAMPLES: Record<ToolType, ExampleCase[]> = {
  message: [
    {
      id: "msg_sbi_kyc",
      title: "Bank KYC & Account Block Threat",
      badge: "High Risk Phishing",
      data: {
        text: "Dear SBI User, your Netbanking account will be blocked by tonight due to incomplete KYC. Complete verification immediately to avoid penalty: http://bit.ly/sbi-kyc-update and share OTP with verification team.",
        channel: "sms",
      },
      predefinedResult: {
        title: "Critical Risk Banking Phishing & Credential Harvest",
        risk_score: 95,
        risk_level: "critical",
        summary: "Coercive financial phishing message impersonating State Bank of India (SBI), threatening account block within hours, demanding OTP disclosure, and routing to an obfuscated bit.ly link.",
        claim: "Your SBI Netbanking account will be permanently blocked by tonight unless you complete instant KYC verification via link and share OTP.",
        observations: [
          "Sender claims to represent State Bank of India (SBI).",
          "Imposes arbitrary 24-hour / midnight deadline ('blocked by tonight').",
          "Solicits direct OTP sharing with external party.",
          "Contains obfuscated short link: http://bit.ly/sbi-kyc-update",
          "Originating channel: SMS with no verifiable banking alphanumeric header.",
        ],
        signals: [
          {
            name: "Direct OTP / Verification Code Solicitation",
            severity: "critical",
            description: "Legitimate banks strictly prohibit staff from asking for OTPs. Soliciting an OTP indicates an active credential theft attempt.",
            evidence: "share OTP with verification team",
          },
          {
            name: "Service Disconnection / Account Block Threat",
            severity: "high",
            description: "Falsely threatens immediate loss of banking access to bypass calm verification.",
            evidence: "account will be blocked by tonight",
          },
          {
            name: "Obfuscated / Shortened URL in Financial Context",
            severity: "high",
            description: "Uses a bit.ly link to disguise the unverified destination landing page.",
            evidence: "http://bit.ly/sbi-kyc-update",
          },
          {
            name: "Institutional Mimicry (SBI)",
            severity: "medium",
            description: "Uses trusted institutional name to elicit automatic trust.",
            evidence: "Dear SBI User",
          },
        ],
        unknowns: [
          "Cannot inspect carrier-level SMS routing or SIM tower location.",
          "Cannot determine whether recipient holds an SBI account.",
        ],
        actions: [
          "Do not click the bit.ly link or reply with any verification codes.",
          "Open your official SBI YONO app or visit onlinesbi.sbi directly to check account alerts.",
          "Forward this SMS to 1909 (TRAI DND spam registry) and report to 1930 (Cyber Crime Helpline).",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "msg_sbi_kyc" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: "msg_wfh_task",
      title: "Work From Home Daily Task Scam",
      badge: "Advance-Fee Fraud",
      data: {
        text: "Part-time job vacancy! Work 1 hour daily from mobile and earn Rs 3000 to 8000. Just like YouTube videos and submit screenshot. Contact Telegram @VIP_Task_Manager to claim your 500 Rs joining bonus.",
        channel: "whatsapp",
      },
      predefinedResult: {
        title: "High Risk Advance-Fee & Task Recruitment Scam",
        risk_score: 80,
        risk_level: "high",
        summary: "Classic pyramid task fraud offering implausible daily wages for trivial actions (liking YouTube videos) and funneling victim into an unmonitored Telegram channel.",
        claim: "Earn Rs 3,000 to 8,000 daily working 1 hour from your phone by liking YouTube videos, plus 500 Rs joining bonus.",
        observations: [
          "Offers disproportionate financial compensation for minimal effort.",
          "Promises instant 'joining bonus' upon contacting Telegram handle.",
          "Channels communication to Telegram (@VIP_Task_Manager) away from auditable platforms.",
        ],
        signals: [
          {
            name: "Daily Task / YouTube Like Fraud Blueprint",
            severity: "high",
            description: "Part-time job lure where initial token payouts precede demands for large deposit top-ups that are subsequently stolen.",
            evidence: "like YouTube videos and submit screenshot",
          },
          {
            name: "Unrealistic Financial Guarantee",
            severity: "high",
            description: "Promising Rs 8000/hour for video likes violates all labor market realities.",
            evidence: "earn Rs 3000 to 8000",
          },
          {
            name: "Off-Platform Telegram Channel Lure",
            severity: "medium",
            description: "Directs victim to private Telegram handles to avoid enterprise moderation and tracking.",
            evidence: "Telegram @VIP_Task_Manager",
          },
        ],
        unknowns: [
          "Cannot verify identity of Telegram administrator account.",
          "Cannot determine if source number was compromised via SIM swap.",
        ],
        actions: [
          "Do not contact the Telegram handle or send screenshots.",
          "Never deposit money to unlock 'job tasks' or 'withdraw earnings'.",
          "Block and report the sender within your messaging client.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "msg_wfh_task" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: "msg_legit_personal",
      title: "Legitimate Personal Message",
      badge: "Low Risk Clean",
      data: {
        text: "Hi Priya, sending you the presentation slides for tomorrow's team sync. Let me know if you want any edits before the 10am call.",
        channel: "whatsapp",
      },
      predefinedResult: {
        title: "Low Risk Casual / Workplace Communication",
        risk_score: 5,
        risk_level: "low",
        summary: "Natural interpersonal conversation regarding workplace slides and scheduling. Contains zero fraud signatures, urgency triggers, or credential requests.",
        claim: "Colleague sending presentation slides for tomorrow's meeting and asking for feedback before 10am.",
        observations: [
          "Natural conversational syntax with contextual workplace references.",
          "Zero embedded links, IP addresses, or shortened URLs.",
          "Zero requests for banking credentials, OTPs, passwords, or payments.",
          "Zero coercion, legal threats, or artificial panic triggers.",
        ],
        signals: [],
        unknowns: [
          "Cannot authenticate identity of sender without carrier verification.",
          "Cannot inspect attachments if transferred separately.",
        ],
        actions: [
          "Standard personal communication; no special counter-fraud actions required.",
          "Ensure shared presentation files are checked with standard endpoint antivirus.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "msg_legit_personal" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
  ],
  website: [
    {
      id: "web_punycode_apple",
      title: "Punycode Homograph Mimic",
      badge: "Critical IDN Spoof",
      data: {
        url: "https://xn--pple-43d.com/login/auth-session",
      },
      predefinedResult: {
        title: "Critical Risk Punycode / IDN Homograph Impersonation",
        risk_score: 95,
        risk_level: "critical",
        summary: "Targeted homograph spoofing attack using Punycode ('xn--pple-43d.com') to render visually identical Cyrillic characters resembling 'apple.com' in browser address bars.",
        claim: "Official Apple ID login and session authentication portal.",
        observations: [
          "Punycode prefix detected: xn--pple-43d.com",
          "Decoded representation mimics Latin 'apple.com' using Cyrillic glyphs.",
          "Path targets authentication session: /login/auth-session",
          "Protocol: HTTPS (Note: Attacker obtained SSL certificate for lookalike domain).",
        ],
        signals: [
          {
            name: "Punycode / Internationalized Homograph Attack",
            severity: "critical",
            description: "Utilizes Unicode lookalike characters (Cyrillic 'а') that modern browsers display as 'apple.com', tricking users into entering Apple ID credentials.",
            evidence: "xn--pple-43d.com",
          },
          {
            name: "Targeted Brand Impersonation (Apple ID)",
            severity: "critical",
            description: "Deceptively targets Apple consumer credential ecosystem.",
            evidence: "apple",
          },
        ],
        unknowns: [
          "Static analysis only: Did not send network probe to avoid triggering attacker telemetry.",
        ],
        actions: [
          "Do not navigate to this address or enter Apple ID credentials.",
          "To access Apple services, manually type 'apple.com' in a clean browser window.",
          "Report phishing site to Google Safe Browsing and Apple Security.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "web_punycode_apple" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: "web_ip_host",
      title: "Direct IP Address Banking Host",
      badge: "High Risk IP Host",
      data: {
        url: "http://192.168.1.50/secure-banking/verify.php",
      },
      predefinedResult: {
        title: "High Risk Direct IP Address Banking Portal",
        risk_score: 85,
        risk_level: "high",
        summary: "Unsecured plaintext HTTP URL pointing to a raw private/unregistered IP host claiming to host a 'secure-banking' portal.",
        claim: "Secure online banking verification gateway.",
        observations: [
          "Direct IP host: 192.168.1.50 (No registered domain name).",
          "Insecure protocol: HTTP unencrypted plaintext transmission.",
          "Suspicious credential harvesting path: /secure-banking/verify.php",
        ],
        signals: [
          {
            name: "Direct IP Address Host",
            severity: "high",
            description: "Legitimate banking institutions never conduct client authentication through raw IP addresses.",
            evidence: "192.168.1.50",
          },
          {
            name: "Insecure Plaintext HTTP Protocol",
            severity: "medium",
            description: "Transmits data unencrypted, vulnerable to local network interception.",
            evidence: "http://",
          },
          {
            name: "Banking Keyword in Unofficial Path",
            severity: "high",
            description: "Uses 'secure-banking' path on an unauthenticated non-domain host.",
            evidence: "secure-banking",
          },
        ],
        unknowns: [
          "IP lies within RFC 1918 private range; cannot verify external routing.",
        ],
        actions: [
          "Never submit banking credentials to raw IP addresses.",
          "Always verify that your bank's website has an authentic domain ending in official TLDs.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "web_ip_host" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: "web_userinfo_at",
      title: "UserInfo @ Deception Exploit",
      badge: "Critical Credential Obfuscation",
      data: {
        url: "https://google.com@phishing-defense-verify.xyz/account",
      },
      predefinedResult: {
        title: "Critical Risk UserInfo Credential Camouflage Attack",
        risk_score: 95,
        risk_level: "critical",
        summary: "Deceptive URL exploit embedding an '@' delimiter. Browsers treat 'google.com' as authentication metadata and navigate to 'phishing-defense-verify.xyz'.",
        claim: "Official Google account verification security portal.",
        observations: [
          "UserInfo '@' character present in authority component.",
          "Deceptive anchor brand: google.com (ignored by browser network stack).",
          "Actual destination host: phishing-defense-verify.xyz",
          "High-risk generic TLD: .xyz",
        ],
        signals: [
          {
            name: "Credential / UserInfo Deception Pattern ('@')",
            severity: "critical",
            description: "Standard browser RFC specification routes all traffic to the host following '@', making 'google.com' pure visual camouflage.",
            evidence: "google.com@phishing-defense-verify.xyz",
          },
          {
            name: "High-Risk Generic Top-Level Domain (.xyz)",
            severity: "high",
            description: "Uses throwaway generic TLD commonly deployed in automated phishing campaigns.",
            evidence: ".xyz",
          },
        ],
        unknowns: [
          "Live server status not inspected (zero-fetch security policy).",
        ],
        actions: [
          "Close the page immediately. Do not log in.",
          "Always check the actual domain immediately before the first forward slash.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "web_userinfo_at" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: "web_legit_proofly",
      title: "Legitimate Domain",
      badge: "Clean Apex Domain",
      data: {
        url: "https://proofly.dev",
      },
      predefinedResult: {
        title: "Low Risk Legitimate Apex Domain",
        risk_score: 5,
        risk_level: "low",
        summary: "Clean, standardized domain structure with modern TLS encryption, zero homograph tricks, zero IP hosts, and minimal subdomain depth.",
        claim: "Official Proofly developer security platform.",
        observations: [
          "Apex domain: proofly.dev",
          "Modern HTTPS encrypted transport.",
          "Standard developer TLD (.dev) requiring mandatory HSTS preload.",
          "Zero deceptive subdomains, symbols, or embedded credentials.",
        ],
        signals: [],
        unknowns: [
          "Zero-fetch policy: Content on the page was not spidered.",
        ],
        actions: [
          "Standard safe domain structure; follow normal internet safety practices.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "web_legit_proofly" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
  ],
  email: [
    {
      id: "email_ceo_wire",
      title: "CEO Impersonation & Wire Redirection",
      badge: "Critical BEC Fraud",
      data: {
        sender: '"CEO David Evans" <david.evans@globaltech-holdings.com>',
        subject: "Urgent: Overdue vendor wire transfer instructions",
        headers: "From: david.evans@globaltech-holdings.com\nReply-To: executive-vault@offshore-pay.xyz\nAuthentication-Results: spf=fail; dkim=fail\nReceived-SPF: fail",
        text: "Hi Team,\n\nPlease process this overdue supplier invoice immediately. The vendor has changed their banking coordinates due to an annual audit. Remit $64,500 to the updated Swift account today before banking cutoff. Do not delay.\n\nRegards,\nDavid",
      },
      predefinedResult: {
        title: "Critical Risk Business Email Compromise (BEC) & Wire Redirection",
        risk_score: 95,
        risk_level: "critical",
        summary: "High-severity executive impersonation (CEO David Evans) requesting an urgent $64,500 wire transfer redirection with deliberate From/Reply-To domain mismatch and SPF/DKIM failures.",
        claim: "CEO David Evans urgently instructing accounts team to remit $64,500 overdue supplier payment to updated offshore banking coordinates today.",
        observations: [
          "From Header: david.evans@globaltech-holdings.com",
          "Reply-To Header: executive-vault@offshore-pay.xyz (Domain Mismatch).",
          "Authentication Header: spf=fail; dkim=fail",
          "Demands immediate wire transfer of $64,500 to 'updated coordinates'.",
        ],
        signals: [
          {
            name: "Severe Sender vs Reply-To Domain Mismatch",
            severity: "critical",
            description: "Replies will bypass the corporate mailbox and be delivered to an offshore attacker mailbox (@offshore-pay.xyz).",
            evidence: "Reply-To: executive-vault@offshore-pay.xyz",
          },
          {
            name: "Email Authentication Verification Failure",
            severity: "critical",
            description: "SPF and DKIM both report hard failure, confirming sender is spoofing the company domain.",
            evidence: "spf=fail; dkim=fail",
          },
          {
            name: "Supplier Banking Coordinate Redirection Lure",
            severity: "high",
            description: "Classic invoice fraud pretext claiming bank accounts changed due to an 'audit'.",
            evidence: "vendor has changed their banking coordinates",
          },
        ],
        unknowns: [
          "Cannot trace mail transfer agent hops without full raw RFC 5322 headers.",
        ],
        actions: [
          "DO NOT execute wire transfer or respond to this email.",
          "Verbally call CEO David Evans on a known, verified internal telephone extension.",
          "Forward email headers to corporate IT security / SOC for domain blocking.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "email_ceo_wire" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: "email_storage_quota",
      title: "Mailbox Storage Quota Harvest",
      badge: "High Risk Credential Phish",
      data: {
        sender: '"IT Support Helpdesk" <support@server-notify-auth.xyz>',
        subject: "Action Required: Mailbox 98% Full - Messages Delayed",
        headers: "From: support@server-notify-auth.xyz\nReply-To: support@server-notify-auth.xyz\nAuthentication-Results: spf=pass; dkim=neutral",
        text: "Your email storage is 98% full. Incoming messages are queued and will be deleted within 24 hours. Click below to verify password and expand storage quota: https://bit.ly/storage-quota-verify",
      },
      predefinedResult: {
        title: "High Risk Corporate Mailbox Storage Phishing",
        risk_score: 85,
        risk_level: "high",
        summary: "IT support impersonation email falsely asserting mailbox quota exhaustion (98%) and threatening message deletion within 24 hours to steal user email credentials via bit.ly link.",
        claim: "IT Support Helpdesk warning that mailbox storage is 98% full and will delete incoming messages within 24 hours unless password is verified.",
        observations: [
          "Presents itself as internal IT Support Helpdesk.",
          "Sender domain is generic third-party: server-notify-auth.xyz",
          "Contains arbitrary 24-hour deletion deadline.",
          "Directs user to bit.ly link to 'verify password'.",
        ],
        signals: [
          {
            name: "Mailbox Storage Quota Harvesting Lure",
            severity: "high",
            description: "Bogus IT warning engineered to panic corporate staff into submitting Active Directory or O365 credentials.",
            evidence: "storage quota exceeded",
          },
          {
            name: "Direct Password Verification Solicitation",
            severity: "critical",
            description: "Authentic IT departments never prompt users to submit passwords through external short links.",
            evidence: "verify password and expand storage",
          },
          {
            name: "Unofficial Helpdesk Sender Domain",
            severity: "high",
            description: "Originates from external .xyz domain rather than internal corporate domain.",
            evidence: "support@server-notify-auth.xyz",
          },
        ],
        unknowns: [
          "Cannot inspect whether enterprise mail gateway quarantined similar incoming messages.",
        ],
        actions: [
          "Do not click the storage verification link or type your password.",
          "Check mailbox storage directly in your email client's native settings panel.",
          "Flag message as phishing to your mail administrator.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "email_storage_quota" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
  ],
  phone: [
    {
      id: "phone_digital_arrest",
      title: "Digital Arrest / CBI Narcotics Threat",
      badge: "Critical Police Impersonation",
      data: {
        phoneNumber: "+91 98200 44123",
        countryCode: "IN",
        claimedOrg: "CBI & Mumbai Cyber Cell",
        callDescription: "Caller claimed to be DCP Cyber Crime Cell Mumbai. They asserted my Aadhaar was found on an international contraband parcel containing narcotics seized at customs. They stated an arrest warrant was issued, instructed me to stay on Skype video for 'digital arrest', and threatened immediate police deployment if I hung up.",
      },
      predefinedResult: {
        title: "Critical Risk Digital Arrest / Law Enforcement Extortion Threat",
        risk_score: 95,
        risk_level: "critical",
        summary: "Violent psychological extortion scam impersonating DCP Cyber Crime Cell / CBI, alleging narcotic parcel seizure, issuing fake arrest warrants, and enforcing continuous video call confinement.",
        claim: "DCP Cyber Crime Cell states your Aadhaar was found on an international contraband parcel containing narcotics, an arrest warrant is active, and you are under 'digital arrest' on Skype.",
        observations: [
          "Caller claims to be senior police / CBI official.",
          "Fabricates contraband parcel seizure at customs.",
          "Demands victim remain isolated on video call under threat of police raid.",
          "Number is standard mobile prefix (+91 98200) without verified government routing.",
        ],
        signals: [
          {
            name: "Digital Arrest / Fake Law Enforcement Coercion",
            severity: "critical",
            description: "Law enforcement agencies NEVER arrest citizens over Skype/WhatsApp video calls or demand funds transfer for clearance.",
            evidence: "stay on Skype video for 'digital arrest'",
          },
          {
            name: "Severe Legal Coercion & Arrest Threat",
            severity: "critical",
            description: "Employs high-threat psychological intimidation to bypass victim's critical reasoning.",
            evidence: "arrest warrant was issued",
          },
          {
            name: "Bogus Customs & Contraband Pretext",
            severity: "high",
            description: "Standard syndicate narrative falsely linking Aadhaar to illegal drug shipments.",
            evidence: "narcotics seized at customs",
          },
        ],
        unknowns: [
          "Caller ID was likely spoofed via virtual SIP trunk.",
        ],
        actions: [
          "HANG UP IMMEDIATELY. There is no legal procedure known as 'digital arrest'.",
          "Do not transfer any money to 'police verification accounts'.",
          "Call 1930 immediately or visit your local police station to report the call.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "phone_digital_arrest" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: "phone_anydesk_remote",
      title: "Debit Card Block & AnyDesk Remote Access",
      badge: "Critical Trojan Installation",
      data: {
        phoneNumber: "+91 22 4589 1000",
        countryCode: "IN",
        claimedOrg: "HDFC Credit Operations",
        callDescription: "Caller stated my debit card was blocked due to an unauthorized international transaction. They instructed me to install AnyDesk from the Play Store and read out the 9-digit code so they could 'remotely unfreeze' the account.",
      },
      predefinedResult: {
        title: "Critical Risk Banking Trojan & Remote Desktop Exploit",
        risk_score: 90,
        risk_level: "critical",
        summary: "Bank card operations impersonation instructing victim to install AnyDesk remote access software to 'unfreeze' a blocked debit card, allowing the fraudster full screen control and OTP interception.",
        claim: "HDFC Credit Operations claiming your debit card was blocked and requiring AnyDesk installation to remotely unfreeze the account.",
        observations: [
          "Caller claims affiliation with HDFC Credit Operations.",
          "Alleges unauthorized international card transactions.",
          "Commands victim to download remote administration tool (AnyDesk).",
          "Demands disclosure of 9-digit remote connection access code.",
        ],
        signals: [
          {
            name: "Remote Desktop Screen-Control Request",
            severity: "critical",
            description: "Installing screen-sharing apps allows criminals to see OTPs, banking screens, and take over devices.",
            evidence: "install AnyDesk from the Play Store",
          },
          {
            name: "Bank Staff / Card Department Impersonation",
            severity: "high",
            description: "Authentic bank support never requests remote device access to service cards.",
            evidence: "HDFC Credit Operations",
          },
        ],
        unknowns: [
          "Landline number displayed (+91 22 4589 1000) was likely spoofed.",
        ],
        actions: [
          "Refuse installation and disconnect the call immediately.",
          "If AnyDesk was installed, turn off Wi-Fi/mobile data instantly and uninstall the application.",
          "Call the official phone number printed directly on the back of your physical card.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "phone_anydesk_remote" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: "phone_telemarketing",
      title: "Unsolicited Telemarketing / Standard Number",
      badge: "Format Check Only",
      data: {
        phoneNumber: "+91 98123 45678",
        countryCode: "IN",
        claimedOrg: "",
        callDescription: "",
      },
      predefinedResult: {
        title: "Low Risk Numbering-Plan Assessment (No Transcript)",
        risk_score: 15,
        risk_level: "low",
        summary: "Valid Indian mobile numbering-plan format. Without a call transcript or specific coercion patterns, no threat indicators can be certified. Follow standard call vigilance.",
        claim: "Standard incoming mobile telephone call.",
        observations: [
          "E.164 Format: +919812345678",
          "Valid telecom numbering-plan format (India Mobile).",
          "Zero conversation transcript or claims submitted.",
        ],
        signals: [],
        unknowns: [
          "Telephony carriers allow CLI spoofing; displaying a valid number does not prove caller authenticity.",
          "No audio recording or transcript provided for contextual inspection.",
        ],
        actions: [
          "Do not share OTPs or personal details if caller asks for them.",
          "If in doubt, hang up and verify identity via official customer support channels.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "phone_telemarketing" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
  ],
  payment: [
    {
      id: "payment_upi_pending",
      title: "UPI Transfer - Pending vs Completed",
      badge: "Status Ambiguity",
      data: {
        amount: "15,000",
        currency: "INR",
        notes: "Customer showed Google Pay screen with 'Processing' status claiming money was debited from their end.",
      },
      predefinedResult: {
        title: "High Risk Ambiguous / Pending Payment Proof",
        risk_score: 75,
        risk_level: "high",
        summary: "Payment screenshot displays an unfinalized 'Processing / Pending' status rather than settled completion. Fraudsters often show pending screens for transactions that will fail or be canceled.",
        claim: "Customer claims successful Rs 15,000 transfer has been debited and will credit shortly.",
        observations: [
          "Amount: ₹ 15,000 (INR)",
          "Observed status: Processing / Pending Authorization",
          "Funds not verified in seller's settled bank ledger.",
        ],
        signals: [
          {
            name: "Transaction in Pending / Processing State",
            severity: "critical",
            description: "A 'Processing' status means money has NOT settled. Releasing goods now exposes seller to complete loss if payment fails.",
            evidence: "Processing",
          },
          {
            name: "Unverified Digital Receipt Reliance",
            severity: "high",
            description: "Screenshots can be mocked using fake payment generator applications in seconds.",
            evidence: "Customer showed Google Pay screen",
          },
        ],
        unknowns: [
          "Digital image cannot confirm whether funds were debited from buyer's account.",
          "Image inspection cannot prove banking gateway settlement.",
        ],
        actions: [
          "DO NOT release goods, transfer assets, or provide services.",
          "Log into your own mobile banking app and check your actual account balance.",
          "Wait for settlement confirmation from your bank, not a customer screenshot.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "payment_upi_pending" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: "payment_missing_utr",
      title: "High Value Transfer Slip (Missing UTR)",
      badge: "Missing Reference",
      data: {
        amount: "50,000",
        currency: "INR",
        notes: "Buyer sent a transaction receipt for goods, but the 12-digit UTR reference number is cut off at the bottom.",
      },
      predefinedResult: {
        title: "High Risk Payment Slip with Missing UTR / Reference",
        risk_score: 70,
        risk_level: "high",
        summary: "Transaction receipt for Rs 50,000 missing the mandatory 12-digit UPI UTR reference number. Without a valid UTR, bank statement reconciliation is impossible.",
        claim: "Buyer claims Rs 50,000 transfer is complete and requests immediate dispatch of goods.",
        observations: [
          "Claimed Amount: ₹ 50,000 (INR)",
          "Mandatory 12-digit UPI UTR / Bank Reference is absent or cropped out.",
          "Transaction cannot be matched against banking ledger.",
        ],
        signals: [
          {
            name: "Missing Bank Reference / UTR Number",
            severity: "high",
            description: "Authentic UPI transaction receipts always generate a unique 12-digit UTR. Its omission is a strong indicator of a cropped or manipulated receipt.",
            evidence: "UTR reference number cut off",
          },
          {
            name: "High Value Goods Release Pressure",
            severity: "high",
            description: "Pressure to release high-value merchandise without settled bank credit.",
            evidence: "50,000 INR",
          },
        ],
        unknowns: [
          "Cannot verify if receipt was legitimately generated by an authentic banking app.",
        ],
        actions: [
          "Require buyer to provide the full 12-digit UTR number from their bank statement.",
          "Independently verify transaction in your bank account before shipping goods.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "payment_missing_utr" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
  ],
  image: [
    {
      id: "image_discount_ad",
      title: "90% Discount Luxury Goods Ad",
      badge: "Scam Advertisement",
      data: {
        context: "Social media ad claiming 90% discount clearance on Apple iPhone 16 Pro if ordered in 15 minutes through an unverified checkout link.",
      },
      predefinedResult: {
        title: "High Risk Deceptive Discount & Counterfeit Advertisement",
        risk_score: 85,
        risk_level: "high",
        summary: "Social media advertisement claiming an implausible 90% discount on iPhone 16 Pro with fake scarcity timers and unverified checkout links.",
        claim: "Official clearance promotion offering 90% discount on flagship Apple iPhone 16 Pro if ordered within 15 minutes.",
        observations: [
          "Offers 90% discount on premium electronics with fixed retail pricing.",
          "Uses artificial countdown timer: 'OFFER EXPIRES IN 00:09:42'.",
          "Directs buyer to an unverified third-party checkout gateway.",
        ],
        signals: [
          {
            name: "Implausible Discount / Clearance Scam Lure",
            severity: "high",
            description: "Discounts above 70% on current-generation premium electronics are almost universally credit card harvesting fronts.",
            evidence: "90% discount clearance on Apple iPhone 16 Pro",
          },
          {
            name: "Fabricated Scarcity & Countdown Pressure",
            severity: "high",
            description: "Fake timer designed to induce impulse buying before checking vendor credibility.",
            evidence: "ordered in 15 minutes",
          },
        ],
        unknowns: [
          "Cannot verify advertiser corporate registration without business registry lookup.",
        ],
        actions: [
          "Do not submit credit card details on the unverified checkout page.",
          "Check official Apple authorized reseller listings to verify pricing.",
          "Report fraudulent advertisement to the host social media platform.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "image_discount_ad" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: "image_bogus_rbi_subsidy",
      title: "Bogus Government Subsidy Certificate",
      badge: "Impersonation Notice",
      data: {
        context: "WhatsApp image claiming RBI is distributing Rs 2,50,000 unclaimed funds to citizens who pay a 1,200 Rs documentation processing fee.",
      },
      predefinedResult: {
        title: "Critical Risk Counterfeit Government Subsidy Notice",
        risk_score: 90,
        risk_level: "critical",
        summary: "Counterfeit official certificate bearing forged Reserve Bank of India (RBI) insignias, claiming Rs 2,50,000 in unclaimed funds upon payment of an upfront documentation fee.",
        claim: "Reserve Bank of India issuing Rs 2,50,000 unclaimed funds to citizens who pay a 1,200 Rs documentation processing fee.",
        observations: [
          "Displays unauthorized imitation of Reserve Bank of India (RBI) insignia.",
          "Promises disbursement of Rs 2,50,000 in 'unclaimed funds'.",
          "Demands upfront advance payment of Rs 1,200 'documentation processing fee'.",
        ],
        signals: [
          {
            name: "Advance-Fee Fraud / Processing Fee Demand",
            severity: "critical",
            description: "The central bank NEVER disburses funds directly to individuals or charges 'release fees'.",
            evidence: "pay a 1,200 Rs documentation processing fee",
          },
          {
            name: "Institutional Impersonation of Reserve Bank of India",
            severity: "critical",
            description: "Using central bank authority to lend false legitimacy to an advance-fee fraud scheme.",
            evidence: "RBI is distributing Rs 2,50,000",
          },
        ],
        unknowns: [
          "Image was compressed; raw digital camera EXIF metadata is stripped.",
        ],
        actions: [
          "Do not pay the 1,200 Rs documentation fee under any circumstances.",
          "Report fake certificate to RBI's official Sachet portal (sachet.rbi.org.in).",
          "Warn contacts on WhatsApp who may have forwarded this graphic.",
        ],
        disclaimer: DISCLAIMER,
        metadata: { is_demo: true, demo_id: "image_bogus_rbi_subsidy" },
        model_used: "demo-predefined",
        timestamp: new Date().toISOString(),
      },
    },
  ],
};
