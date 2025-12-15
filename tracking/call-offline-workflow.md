# Call Offline Conversion Workflow

This document describes how phone call conversions are reviewed, qualified, and uploaded as offline conversions.

## Call Sources
- Google Ads call campaigns
- Website call tracking numbers

## Qualification Criteria
Calls are reviewed and marked as qualified based on:
- Call duration thresholds
- Caller intent (service-related vs non-service)
- Exclusion of spam, test, vendor, or fraudulent calls

## Review Process
1. Call details are reviewed outside of this repository
2. Calls are classified as qualified or unqualified
3. Only qualified calls proceed to offline upload

## Offline Upload
- Offline conversions are uploaded to Google Ads
- Uploads are aligned to original ad interactions
- Only necessary identifiers are used for matching

## Exclusions
- Spam and repeat abuse calls
- Non-customer inquiries
- Internal test calls
- Calls lacking sufficient intent

## Data Handling
- Raw call logs and identifiers remain offline
- This repository documents logic, not data
