# Sagelight Studio Privacy Policy

**Last Updated:** November 22, 2026 | **Effective:** May 21, 2026

---

> **In brief:** This policy covers all apps published by Sagelight Studio, including **SageBills**, **SageMeet**, and **SageDocs**. Your data belongs to you. SageBills and SageDocs use a local-first architecture; SageMeet optionally sends data to OpenAI when you use AI features. SageDocs adds enhanced security with AES-256-GCM encryption and biometric/PIN protection.

---

## Key Points

- **SageBills: 100% Local Data** — All your data stays on your device. No servers, no cloud, no exceptions.
- **SageMeet: Local + Optional AI** — Data is stored locally. When you use AI features, audio and text are sent to OpenAI APIs. A Private Mode disables all external transmission.
- **SageDocs: Local + iCloud + Enhanced Security** — Sensitive documents are encrypted with AES-256-GCM and protected by biometric authentication or a master PIN. iCloud sync keeps your vault in sync across devices.
- **No Ads, No Tracking** — No ads, no advertising IDs and no cross-app tracking in any of our apps. SageBills and SageMeet send no analytics; SageDocs sends anonymous usage statistics you can turn off.
- **Encrypted at Rest** — Data is protected by Apple's NSFileProtectionComplete when your device is locked. SageDocs adds an additional layer of AES-256-GCM encryption for all attachments.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Who We Are](#2-who-we-are)
3. [Privacy-First Architecture](#3-privacy-first-architecture)
4. [Data We Process](#4-data-we-process)
5. [How We Use Your Data](#5-how-we-use-your-data)
6. [Legal Basis for Processing](#6-legal-basis-for-processing)
7. [Data Storage and Security](#7-data-storage-and-security)
8. [Data Retention](#8-data-retention)
9. [Third-Party Services](#9-third-party-services)
10. [International Data Transfers](#10-international-data-transfers)
11. [Cookies and Tracking](#11-cookies-and-tracking)
12. [Your Rights Under GDPR](#12-your-rights-under-gdpr)
13. [Children's Privacy](#13-childrens-privacy)
14. [Changes to This Policy](#14-changes-to-this-policy)
15. [Contact Us](#15-contact-us)

---

## 1. Introduction

Welcome to Sagelight Studio. This Privacy Policy explains how we handle your information when you use our applications — **SageBills** (utility bill tracking), **SageMeet** (meeting recording and AI transcription), and **SageDocs** (personal document vault) — on iOS and macOS.

This policy complies with the General Data Protection Regulation (GDPR), the ePrivacy Directive, and Apple App Store Guidelines (sections 5.1.1 and 5.1.2).

## 2. Who We Are

Sagelight Studio is the trading name under which **Florin Nica**, an independent individual developer based in Romania, European Union, builds and maintains the apps covered by this policy. For the purposes of the GDPR (Article 4(7)), Florin Nica is the data controller.

- **Data Controller:** Florin Nica (natural person)
- **Trading as:** Sagelight Studio
- **Legal status:** Independent individual developer; no separate legal entity (no PFA, no SRL, no other registered form)
- **Location:** Romania, European Union
- **Verified developer of record:** [apps.apple.com/developer/sagelight-studio](https://apps.apple.com/developer/sagelight-studio) — Apple has verified the identity of the controller as part of the Apple Developer Program enrollment
- **Contact (general & data subject requests):** contact@sagelight-studio.com

For the purposes of the GDPR, the developer acts as the data controller. For SageBills, all data processing occurs locally on your device and your data never reaches us. For SageMeet, data is processed locally except when you explicitly use AI features, which transmit data to OpenAI (see Sections 9 and 10). For SageDocs, your documents are stored locally and synced to your private iCloud account; no document data is transmitted to Sagelight Studio or any third party other than Apple. From version 1.0.14, SageDocs also sends anonymous usage statistics to TelemetryDeck (see Sections 4, 6 and 9).

## 3. Privacy-First Architecture

### SageBills

SageBills is designed with a **local-only, zero-server architecture**:

- **No servers.** We do not operate any backend servers that receive, store, or process your data.
- **No cloud sync.** Your data is not uploaded to any cloud service by SageBills.
- **No analytics.** We do not collect usage analytics, crash reports, or telemetry of any kind.
- **No tracking.** We do not track your behavior, location, or activity.
- **No third-party SDKs.** The app is built entirely with Apple frameworks. Zero external dependencies.

> All data you enter into SageBills is stored on your device and synced securely to your private iCloud account. It is never sent to our servers or shared with third parties.

### SageMeet

SageMeet stores all data locally on your device and optionally syncs via iCloud. However, when you use AI-powered features:

- **Audio and text are sent to OpenAI APIs** (Whisper for transcription, GPT-4o for notes and analytics, embedding APIs for semantic search) when you explicitly request AI processing.
- **Private Mode** disables all external data transmission. When enabled, no data leaves your device.
- **No analytics or tracking.** SageMeet does not collect usage analytics, crash reports, or telemetry.
- **Your OpenAI API key** is stored securely in the device Keychain and is only used to authenticate requests you initiate.

> When AI features are disabled or Private Mode is on, SageMeet behaves identically to SageBills — fully local, zero external transmission.

### SageDocs

SageDocs is a **personal document vault** with enhanced security for sensitive documents such as identity cards, insurance policies, and loan agreements:

- **AES-256-GCM encryption.** All document attachments (scans, photos, PDFs) are encrypted before storage using AES-256-GCM with a key derived from your master PIN via PBKDF2-SHA256 (600,000 iterations).
- **Biometric or PIN authentication.** The vault is locked behind Face ID, Touch ID, or a master PIN. The app cannot be accessed without authentication.
- **iCloud sync.** Document metadata and encrypted attachments sync via Apple CloudKit to your private iCloud account. Data is encrypted before it reaches iCloud and cannot be read by Apple or Sagelight Studio.
- **No AI features.** SageDocs does not use artificial intelligence, and no document data is sent to any external API.
- **Anonymous usage statistics, no tracking.** From version 1.0.14, SageDocs sends a short, fixed list of anonymous usage events to TelemetryDeck, a privacy-focused analytics service, so we can see where people get stuck. You can turn this off in Settings. There is no crash reporting, no advertising SDK, and nothing that follows you across other apps or websites.
- **One third-party SDK.** Apart from the TelemetryDeck SDK, the app is built entirely with Apple frameworks.
- **Privacy-respecting logging.** Security events (authentication, lockout) are logged via Apple's OSLog system. Logs never contain PIN values, encryption keys, or document content.

> SageDocs stores your documents on your device and optionally in your private iCloud account. All attachments are encrypted with your personal key. We cannot read your documents.

## 4. Data We Process

### 4.1 SageBills Data

All of the following data is stored **on your device and in your private iCloud account**:

- **Bill Data:** Bill amounts and currency, provider/utility company names, bill categories, bill dates, notes, consumption readings (kWh, cubic meters, etc.)
- **OCR-Scanned Data:** When you scan an invoice, Apple's Vision framework extracts text **entirely on your device**. The original image is not retained after scanning unless you choose otherwise.
- **App Preferences:** Currency and display preferences, notification preferences, savings goals configuration, onboarding and consent status.
- **Keychain Data:** GDPR consent date (for tamper detection). No personal data is stored in the Keychain.
- **Spotlight Index:** Bill records are indexed in Apple's CoreSpotlight for device search. This index is local to your device.

### 4.2 SageMeet Data

The following data is stored **on your device and optionally in your private iCloud account**:

- **Audio Recordings:** Meeting recordings stored locally and optionally in iCloud Drive.
- **Transcripts:** Text generated from audio via OpenAI's Whisper API (when AI features are used) or stored locally.
- **AI-Generated Notes:** Meeting summaries, action items, and analytics generated by GPT-4o.
- **Semantic Embeddings:** Vector representations of your meeting content stored in a local SQLite database for search.
- **Calendar Data:** Read-only access to your calendar for meeting context. SageMeet does not modify your calendar.
- **Speaker Analytics:** AI-generated speaking time and participation data (processed via GPT-4o-mini).
- **OpenAI API Key:** Stored securely in the device Keychain. Used only to authenticate your requests to OpenAI.
- **App Preferences:** Display settings, recording preferences, AI feature toggles, Private Mode status.
- **Spotlight Index:** Meeting records are indexed in Apple's CoreSpotlight for device search.

### 4.3 SageDocs Data

The following data is stored **on your device and in your private iCloud account**:

- **Document Metadata:** Document titles, issuers, reference numbers, issue dates, expiry dates, and notes.
- **Document Categories:** Category names, icons, and colors (including user-created categories) for organizing documents such as identity cards, insurance, loans, contracts, medical records, etc.
- **Encrypted Attachments:** Document scans, photos, and PDFs encrypted with AES-256-GCM before storage. Stored using SwiftData's external storage. Thumbnails are also encrypted.
- **Reminder Settings:** Expiry reminder intervals for documents that have expiration dates.
- **Keychain Data:** Master PIN hash (salted PBKDF2-SHA256), encryption salt, biometric enrollment state, derived encryption key (biometric-protected), lockout state, and onboarding status. No plaintext PINs are ever stored.
- **Security Events:** Privacy-respecting logs of authentication successes/failures, lockouts, and vault operations via Apple's OSLog. Logs never contain personal data, PINs, or encryption keys.

From version 1.0.14, SageDocs also **sends anonymous usage statistics to TelemetryDeck** (TelemetryDeck GmbH, Germany), a privacy-focused analytics service, unless you turn them off. They never include a document, title, category, note, file name, PIN or encryption key:

- **Setup:** which onboarding step was shown, and that setup was finished.
- **Vault unlocked:** with your plan state (trial and days left, subscribed, read-only, or early-adopter access).
- **Document added:** and whether it has an expiry date (never its name or contents).
- **Upgrade screen:** that it was shown or closed, and which feature opened it.
- **Purchases:** that a purchase was started, completed, not completed or failed, and which plan (monthly or yearly); for a completed purchase also the product, storefront country, currency and price.
- **Restore Purchases:** that it was tapped.
- **End-of-trial summary:** that it was shown.
- **Technical details added to every event:** app version and build and how the app was installed (App Store, TestFlight or a development build); operating system version, device model, processor type, platform, screen size and orientation; language, region, time zone, text direction and light or dark appearance; accessibility settings such as text size, bold text and reduce motion; the hour, weekday and date of the event; and usage counters kept on your device (number of sessions, distinct days of use, session length, date of first use).
- **Random identifier:** created by the app on your device and hashed before it is sent. It is not your Apple Account, a device identifier or an advertising identifier, and it is not linked to your name or email (we never ask for either).

**How to turn it off:** Settings → Privacy & Security → Share anonymous usage statistics. Turning it off stops sending and deletes the identifier from your device; turning it on again creates a new one. The SageDocs widget and share extension never send statistics.

## 5. How We Use Your Data

### SageBills

Because all data stays on your device, "use" means local processing within the app:

| Purpose | Description |
|---|---|
| **Bill tracking** | Displaying, organizing, and managing your utility bills |
| **Cost prediction** | Generating statistical predictions based on your history |
| **Anomaly detection** | Identifying unusual bills that deviate from patterns |
| **Savings tracking** | Calculating progress toward your savings goals |
| **Invoice scanning** | Extracting bill data from photos via on-device OCR |
| **Reminders** | Sending local notifications for upcoming due dates |
| **Data export** | Generating CSV files when you request it |
| **Device search** | Making bills findable through Spotlight search |

### SageMeet

| Purpose | Description | Involves External Service? |
|---|---|---|
| **Meeting recording** | Capturing audio on your device | No |
| **Transcription** | Converting audio to text via OpenAI Whisper API | Yes (OpenAI) |
| **AI note generation** | Generating summaries and action items via GPT-4o | Yes (OpenAI) |
| **Semantic search** | Creating embeddings for content search via OpenAI API | Yes (OpenAI) |
| **Speaker analytics** | Analyzing participation patterns via GPT-4o-mini | Yes (OpenAI) |
| **Calendar integration** | Reading calendar events for meeting context | No |
| **Spotlight indexing** | Making meetings findable through device search | No |
| **iCloud sync** | Syncing meeting data across your devices | No (Apple infrastructure) |

### SageDocs

Because all data stays on your device and in your private iCloud, "use" means local processing:

| Purpose | Description |
|---|---|
| **Document storage** | Securely storing and organizing personal documents |
| **Document scanning** | Capturing documents via camera with on-device processing |
| **Encryption** | Encrypting all attachments with AES-256-GCM before storage |
| **Authentication** | Protecting vault access with biometrics (Face ID/Touch ID) or master PIN |
| **Expiry tracking** | Monitoring document expiration dates and alerting you |
| **Reminders** | Sending local notifications for upcoming document expirations |
| **Secure sharing** | Decrypting documents temporarily for sharing via system share sheet |
| **iCloud sync** | Syncing encrypted documents across your Apple devices |
| **Anonymous usage statistics** | Seeing which steps of setup, everyday use and upgrading people reach, so we can improve the app (sent to TelemetryDeck; can be turned off) |

## 6. Legal Basis for Processing

**SageBills:** Under Article 6(1)(a) of the GDPR, our legal basis is **your explicit consent**, which you provide during the app's onboarding process.

**SageMeet:** Our legal bases are:
- **Consent** (Art. 6(1)(a)) — for optional AI features and data processing during onboarding.
- **Contractual necessity** (Art. 6(1)(b)) — for core AI processing features that are integral to the service you requested (transcription, note generation).

**SageDocs:** Under Article 6(1)(a) of the GDPR, our legal basis is **your explicit consent**, which you provide during the app's onboarding process. The enhanced security measures (encryption, biometric authentication) serve to protect the sensitive nature of the documents you store.

You may withdraw your consent at any time through any app's Settings. Withdrawal does not affect the lawfulness of processing carried out before the withdrawal.

## 7. Data Storage and Security

### 7.1 Local Storage (All Apps)

All data is stored using Apple's SwiftData framework with **NSFileProtectionComplete** encryption:

- Data is encrypted when your device is locked
- Data is only accessible when your device is unlocked and authenticated
- Encryption keys are tied to your device passcode/biometrics

### 7.2 SageDocs Enhanced Security

SageDocs provides additional security layers beyond standard device encryption:

- **AES-256-GCM encryption:** All document attachments are encrypted using AES-256-GCM with a key derived via PBKDF2-SHA256 (600,000 iterations, exceeding OWASP 2023 minimum recommendations).
- **Keychain-stored encryption salt:** A 256-bit random salt is generated per installation and stored in the Apple Keychain with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` protection.
- **Biometric-protected key storage:** The derived encryption key can be stored in the Keychain with `.biometryCurrentSet` access control, meaning it is invalidated if biometric enrollment changes.
- **Constant-time PIN verification:** PIN comparison uses constant-time algorithms to prevent timing attacks.
- **Progressive lockout:** Failed authentication attempts trigger escalating cooldown periods.
- **Biometric enrollment monitoring:** The app detects changes in biometric enrollment (new fingerprint/face added) and requires PIN re-entry for security.

### 7.3 No Remote Storage (SageBills)

SageBills does not transmit data to any remote server. We have no ability to access, read, or recover your data.

### 7.4 Your Responsibility

> **Important:** You are responsible for maintaining backups through your device's backup mechanisms (e.g., iCloud device backup, Time Machine). For SageDocs, remember your master PIN — we cannot recover it, as we do not have access to your encryption keys.

## 8. Data Retention

Your data is retained on your device for as long as you keep the app installed and choose to retain it. You have full control:

- **Delete individual records** at any time within any app
- **Delete all data** using the option in Settings
- **Uninstall the app** to remove all associated data
- **SageDocs: Reset vault** to delete all documents and encryption keys

We do not retain any copy of your documents or app data because we never receive it. The one exception is the SageDocs anonymous usage statistics (version 1.0.14 and later), which TelemetryDeck holds on our behalf. TelemetryDeck currently has no fixed deletion schedule for stored events and states that it expects to delete them after 7 to 10 years. Because the statistics are not linked to you, we cannot identify, export or delete one person's events (Art. 11 GDPR); turning the switch off stops new events and deletes the identifier from your device.

## 9. Third-Party Services

### 9.1 Apple iCloud (SageMeet & SageDocs)

SageMeet and SageDocs optionally sync data via Apple's iCloud (CloudKit / iCloud Drive). Apple acts as a data processor under its own GDPR commitments. iCloud data is encrypted in transit and at rest. For SageDocs, attachments are additionally encrypted with AES-256-GCM before reaching iCloud.

### 9.2 OpenAI (SageMeet only)

When you use AI features in SageMeet, audio and text data are sent to **OpenAI LLC** for processing. OpenAI acts as a **data processor** under Article 28 GDPR. The following OpenAI services are used:

- **Whisper API** — audio-to-text transcription
- **GPT-4o** — meeting note generation and summarization
- **GPT-4o-mini** — speaker analytics processing
- **Embedding API** — semantic vector generation for search

OpenAI's data handling is governed by their [API Data Usage Policy](https://openai.com/policies/api-data-usage-policies). OpenAI does not use API data to train their models. OpenAI is certified under the **EU-US Data Privacy Framework** (DPF).

You authenticate with OpenAI using your own API key. We do not have access to your OpenAI account.

### 9.3 SageBills & SageDocs: No Other Third Parties

SageBills contains **no third-party SDKs, frameworks, libraries, or services** beyond Apple's own frameworks. SageDocs contains one, the TelemetryDeck SDK, and no advertising, crash-reporting or other analytics SDK: from version 1.0.14 it sends the anonymous usage statistics described in Section 4 to **TelemetryDeck GmbH**, Von-der-Tann-Str. 54, 86159 Augsburg, Germany, which acts as a data processor (Art. 28 GDPR) under its [data processing agreement](https://telemetrydeck.com/dpa/) and stores the data on servers in the European Union (Germany and the Netherlands). TelemetryDeck states that it never stores IP addresses; see [TelemetryDeck's privacy information](https://telemetrydeck.com/privacy/). We do not sell your data, and apart from the processors named in this section we do not share or disclose it to any third party.

## 10. International Data Transfers

**SageBills** does not transfer your data internationally. Your data remains on your device at all times.

**SageMeet** transfers data to the United States when you use AI features, as OpenAI's API infrastructure is located in the US. These transfers are conducted under **two complementary lawful mechanisms**:

1. The **EU-US Data Privacy Framework (DPF)** under Commission Implementing Decision (EU) 2023/1795, under which OpenAI LLC is a certified participant; and
2. The **Standard Contractual Clauses (SCCs)** for the transfer of personal data to third countries (Commission Implementing Decision (EU) 2021/914), which are incorporated into OpenAI's Data Processing Addendum.

If the DPF is invalidated by a future court decision (as occurred with the earlier Safe Harbor and Privacy Shield frameworks), the SCCs remain in place as the independent lawful transfer mechanism. When Private Mode is enabled, no international transfers occur.

**Website (Google Ads):** Cookieless tag pings are transferred to Google LLC (US) under the same dual mechanism — DPF + SCCs incorporated into Google's Controller-Controller Data Protection Terms.

**SageDocs** does not transfer your documents to any third party. iCloud sync is handled by Apple under Apple's own GDPR commitments and data processing agreements. The anonymous usage statistics are sent to TelemetryDeck, which stores them on servers in the European Union (Germany and the Netherlands).

## 11. Cookies and Tracking

**Apps:** No Sagelight Studio app uses cookies, web beacons, pixels, device fingerprinting or advertising identifiers, and none tracks you across other apps or websites. No app contains advertising. From version 1.0.14, SageDocs sends anonymous usage statistics tied to a random identifier that the app creates on your device (see Section 4); it is hashed before it is sent, is not a device or advertising identifier, and is deleted when you turn the statistics off.

**Website (sagelight-studio.com):** The Sagelight Studio website loads the Google Ads conversion tag (`AW-17758801825`) operated by Google Ireland Limited, with Google LLC (US) as sub-processor, to measure the effectiveness of paid advertising campaigns that link to the App Store.

The tag is configured under **Google Consent Mode v2 (Advanced)**, with all four signals set to **denied by default**:

- `ad_storage` — denied (no advertising cookies stored)
- `ad_user_data` — denied (no user data shared with Google for ads)
- `ad_personalization` — denied (no personalised advertising)
- `analytics_storage` — denied (no analytics cookies; reserved for future use)

Two further protective flags are set on every page:

- `ads_data_redaction: true` — Google redacts identifying information from the cookieless pings sent while consent is denied.
- `url_passthrough: true` — when consent is denied, click identifiers (`gclid`) travel via URL parameters only, never via cookies.

While consent is denied, Google receives only redacted, cookieless pings containing minimal functional information — timestamp, browser user agent, source URL, a boolean indicating whether a click identifier was present, a per-pageview random number, and the consent state itself. No cookies are stored and no individual is identified; these pings power Google's *modelled* (estimated) conversion reporting. If you opt in via the **Cookie preferences** link in the footer, you can grant **Advertising** and **Analytics** consent independently, and a Google Ads cookie may then be stored to attribute App Store visits to specific ad campaigns (including the Google Click ID, `gclid`).

- **Lawful basis (denied state):** Legitimate interest (Art. 6(1)(f)) — understanding aggregate advertising effectiveness without identifying individuals.
- **Lawful basis (opted-in state):** Consent (Art. 6(1)(a)).
- **Recipients:** Google Ireland Limited (data processor, Art. 28); Google LLC, US (sub-processor).
- **Transfer mechanism:** EU-US Data Privacy Framework + Standard Contractual Clauses incorporated into Google's Controller-Controller Data Protection Terms.
- **Retention:** Per Google Ads default retention settings (currently 14 months for ad conversion data; you can request deletion via the cookie preferences interface).
- **Withdrawal of consent:** at any time via the **Cookie preferences** link in the footer, by clearing site cookies, by using a browser-level tracking blocker, or by emailing contact@sagelight-studio.com. Your choice is persisted only in your browser's localStorage; nothing about it is transmitted to us.

This Google Ads tag is **exclusive to the website** and is not present in any Sagelight Studio app.

## 12. Your Rights Under GDPR

As a resident of the EU or EEA, you have the following rights:

| Right | How to Exercise |
|---|---|
| **Right of access** (Art. 15) | View all your data directly in the app |
| **Right to rectification** (Art. 16) | Edit any data entry within the app |
| **Right to erasure** (Art. 17) | Delete individual records or all data via Settings |
| **Right to restriction** (Art. 18) | Contact contact@sagelight-studio.com |
| **Right to portability** (Art. 20) | Export your data from within the app |
| **Right to object** (Art. 21) | Withdraw consent in Settings |
| **Withdraw consent** (Art. 7(3)) | Single action in Settings, takes effect immediately |
| **Lodge a complaint** (Art. 77) | Contact your national data protection authority |

Most rights can be exercised directly within the app. For other rights, email contact@sagelight-studio.com.

### Supervisory Authority

If you are in Romania, the competent authority is **ANSPDCP** ([www.dataprotection.ro](https://www.dataprotection.ro)). You may also contact the authority in your country of residence.

## 13. Children's Privacy

Our apps are not directed at children under 16. We do not knowingly process data from children. Since data is stored locally, we have no means to identify or verify user age.

## 14. Changes to This Policy

We may update this Privacy Policy from time to time. The "Last Updated" date will be revised, and material changes will be communicated through an in-app notice.

## 15. Contact Us

- **Contact:** contact@sagelight-studio.com

We aim to respond to all privacy-related inquiries within 30 days, as required by the GDPR.

---

*Sagelight Studio — Built with care in Romania, EU*
