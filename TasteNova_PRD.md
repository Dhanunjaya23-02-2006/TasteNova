# TasteNova - Product Requirements Document (PRD) & Executive Summary

**Version:** 1.0  
**Document Type:** Executive Summary & PRD  
**Prepared For:** TasteNova  
**Prepared By:** Product Management  
**Status:** Draft  

### Confidentiality
This document contains confidential and proprietary information belonging to TasteNova. It is intended solely for founders, investors, engineering teams, designers, advisors, and authorized stakeholders. Unauthorized copying, disclosure, or distribution is prohibited.

---

### Document Information

| Item | Value |
|---|---|
| Product | TasteNova |
| Product Type | Home Chef Marketplace |
| Industry | FoodTech |
| Platform | Web + Android + iOS |
| Version | 1.0 |
| Stage | MVP Development |

### Version History

| Version | Date | Description |
|---|---|---|
| 1.0 | Initial Release | Executive Summary & Full PRD |

---

## Table of Contents
1. Executive Overview
2. Vision & Mission
3. Problem Statement & Solution
4. Product Overview
5. Business Model & Ecosystem
6. Home Chef Module
7. Delivery Partner Module
8. Super Admin Module
9. Sub-admin Module
10. Finance, Wallet & Escrow
11. Marketing & Promotion Engine
12. Search & Recommendation Engine
13. Notification System
14. Support & Complaint Management
15. Security & Compliance
16. Performance Requirements
17. Analytics & Reporting
18. Acceptance Criteria
19. Risk Assessment
20. Product Roadmap & Future Enhancements

---

## 1. Executive Overview
TasteNova is a technology-enabled marketplace connecting verified home chefs with customers seeking fresh, hygienic, homemade meals. Unlike conventional food delivery platforms that primarily aggregate restaurants, TasteNova empowers home chefs to operate legitimate food businesses while providing customers with authentic home-cooked food.

The platform addresses a significant gap in the Indian food delivery market by serving users who prefer homemade meals over restaurant food, including students, bachelors, working professionals, senior citizens, and families.

## 2. Vision & Mission
### Vision
To become India's most trusted marketplace for homemade food by enabling millions of home chefs to build sustainable businesses while making healthy, affordable home-cooked meals accessible to every household.

### Mission
- Empower home chefs with technology and market access.
- Deliver hygienic, high-quality homemade meals.
- Build trust through verified chefs and transparent operations.
- Create sustainable income opportunities for households.
- Promote regional and authentic cuisines across India.

## 3. Problem Statement & Solution
### Problem Statement
Current food delivery platforms focus predominantly on restaurants. This leaves several unmet needs:
**Customers:**
- Limited access to genuine homemade food.
- Increasing preference for healthier meals.
- High restaurant prices.
- Lack of regional home-style cuisine.
- Limited subscription options for daily meals.

**Home Chefs:**
- Limited avenues to monetize cooking skills.
- Difficulty reaching local customers.
- Lack of technology and payment infrastructure.
- Challenges with marketing and customer acquisition.

### Solution
TasteNova provides a comprehensive marketplace where:
- Home chefs register and undergo verification.
- Customers discover nearby chefs based on delivery location.
- Orders are placed and tracked in real time.
- Payments are processed securely.
- Delivery is managed by TasteNova or approved delivery partners.
- Earnings are settled through a secure wallet and payout system.

## 4. Product Overview
TasteNova consists of six integrated platforms:
1. Customer Application
2. Home Chef Portal
3. Delivery Partner Application
4. Super Admin Dashboard
5. City Sub-admin Dashboard
6. Marketing & Finance Console

Each platform is designed with role-based permissions and interconnected workflows.

## 5. Business Model & Ecosystem
### Revenue Streams
- Platform commission (Commission on each order)
- Delivery fees
- Featured chef promotions
- Sponsored listings
- Subscription meal plans
- Advertising placements
- Festival and promotional campaigns

### User Ecosystem
- **Customers:** Order homemade meals, manage addresses, subscriptions, wallets, and reviews.
- **Home Chefs:** Manage menus, orders, earnings, payouts, availability, and customer interactions.
- **Delivery Partners:** Accept deliveries, manage earnings, and track payouts.
- **Super Admin:** Manage platform operations, finance, compliance, analytics, and system configuration.
- **Sub-admins:** Manage localized operations including chef verification, support, promotions, and analytics.

### Competitive Advantage
- Dedicated focus on home chefs.
- Verified chef onboarding.
- Location-based chef discovery.
- Escrow-based financial system.
- Flexible wallet and payout architecture.
- Localized city operations.

### Target Audience
**Primary segments:** Students, Bachelors, Working professionals, Families, Senior citizens.
**Secondary segments:** Fitness enthusiasts, Regional cuisine lovers, Corporate meal subscribers.

### Technology Stack
- **Frontend:** React, React Native
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT, OTP
- **Payments:** Razorpay
- **Maps:** Google Maps API
- **Notifications:** Firebase Cloud Messaging, SMS, Email
- **Deployment:** Docker, Cloud infrastructure

---

## 6. Home Chef Module
### 6.1 Objective
The Home Chef Module enables individuals to legally sell homemade food through the TasteNova marketplace. It provides complete functionality for registration, verification, menu management, order processing, financial management, analytics, and customer engagement.

### 6.2 Registration & Verification
**Identity Verification (KYC):** Aadhaar Card, PAN Card, Selfie Verification, Address Proof.
**Food Business Verification:** FSSAI Registration Number and Certificate Upload.
**Kitchen Verification:** Chef uploads photos of Cooking Area, Storage Area, Equipment.

### 6.3 Menu & Order Management
- **Menu Management:** Add, Edit, Delete, Pause, Duplicate Dish. Manage Categories, Pricing, Ingredients, Images.
- **Order Workflow:** New Order ➔ Accept ➔ Preparing ➔ Ready ➔ Picked Up ➔ Delivered.
- **Order Capacity:** Maximum simultaneous orders, Maximum daily orders.

---

## 7. Delivery Partner Module
### 7.1 Objective
Provide reliable last-mile delivery while ensuring transparency, efficiency, and fair earnings.

### 7.2 Features
- **Registration & Verification:** Identity, Vehicle Documents, Driving License, Background Check.
- **Order Assignment:** Nearest available rider ➔ Vehicle compatibility ➔ Current workload ➔ Acceptance rate ➔ ETA.
- **Earnings & Wallet:** Per order earnings, Distance incentive, Peak hour bonus, Referral bonus.

---

## 8. Super Admin Module
### 8.1 Objective
The Super Admin Dashboard is the command center of TasteNova. It provides complete control over platform operations, users, finances, marketing, analytics, security, and system configurations.

### 8.2 Features
- **User Management:** Manage Customers, Chefs, Delivery Partners.
- **Financial Management:** Dashboard, Wallet Management, Payout Management, Refund Management.
- **Marketing Management:** Create Coupons, Offers, Banner Campaigns, Featured Chefs, Referral Campaigns.

---

## 9. Sub-admin Module
### 9.1 Objective
Sub-admins manage operations within assigned cities while maintaining limited access.

### 9.2 Responsibilities
- Verify Home Chefs, Kitchens, and Delivery Partners in assigned city.
- Handle Support Tickets and Resolve Local Complaints.
- Approve Small Refunds and Launch City Campaigns.

---

## 10. Finance, Wallet & Escrow
### 10.1 Architecture
Every Chef and Delivery Partner has a:
- Pending Balance
- Available Balance
- Locked Balance

### 10.2 Escrow
- **Purpose:** Fraud Protection, Refund Handling, Dispute Resolution.
- **Default Hold Period:** T+2 days (configurable).

### 10.3 Commission & Refunds
Supports Global, City, and Chef-Specific Commissions. Comprehensive Refund Workflow based on cancellation reasons (Customer, Chef, Delivery Failure).

---

## 11. Marketing & Promotion Engine
### 11.1 Campaign Types
Global, City, Category, Chef, Festival Campaigns, Flash Sale.
### 11.2 Coupon Engine
Flat Discount, Percentage Discount, Free Delivery, Cashback, Referral. Supports configurable rules (Min Order, Usage Limit).

---

## 12. Search & Recommendation Engine
### 12.1 Search & Filters
Users can search by Dish Name, Chef Name, Cuisine, Category. Filters include Veg/Non-Veg, Price, Rating, Distance, Delivery Time.
### 12.2 Nearby Chef Algorithm
Ranks based on Delivery Availability, Distance, Chef Rating, Order Acceptance Rate, Preparation Time.

---

## 13. Notification System
Supports Push Notifications, Email, SMS, In-App Notifications. 
Includes configurable retry policies and notification templates.

---

## 14. Support & Complaint Management
Structured ticketing system for Customers, Chefs, Delivery Partners, Finance, and Technical issues. Includes SLAs (Critical: 2 Hours, Low: 72 Hours) and Escalation Matrices.

---

## 15. Security & Compliance
- **Authentication:** OTP for Customers/Chefs, Email+Password+MFA for Admin.
- **Data Encryption:** bcrypt for passwords, AES Encryption for sensitive data.
- **Compliance:** Supports FSSAI, GST, RBI Payment Guidelines, Indian Data Protection Laws.

---

## 16. Performance Requirements
- **Availability:** 99.9%
- **Response Time:** Login < 2 seconds, Checkout < 3 seconds.
- **Scalability:** Built to scale from 10,000 Orders/Day initially to 500,000 Orders/Day.

---

## 17. Analytics & Reporting
Detailed metrics for Customers (Retention, Repeat Orders), Chefs (Acceptance Rate, Top Dishes), Delivery (Average Time), Business (GMV, Refunds), and Marketing (Campaign ROI).

---

## 18. Acceptance Criteria
The MVP will be considered complete when the core flows (Registration, Ordering, Payment, Delivery, Payouts, Admin Management) are fully functional across Customer, Chef, Delivery, and Admin modules.

---

## 19. Risk Assessment
Outlines business risks (Low Chef Adoption, Customer Acquisition Cost, Food Safety, Fraud) and corresponding mitigation strategies (Referral Programs, KYC, Escrow, Verification).

---

## 20. Product Roadmap & Future Enhancements
- **Phase 1:** MVP (Customer, Chef, Delivery, Admin, Wallet).
- **Phase 2:** Multi-City Expansion, Subscription Meals.
- **Phase 3:** Advanced Finance, Escrow Automation.
- **Phase 4:** AI Features, Dynamic Pricing.
- **Phase 5:** Enterprise Corporate Catering, Cloud Kitchens.
- **Future:** AI-powered recommendations, voice ordering, dynamic delivery pricing, wearable integrations.

---
*End of Document*
