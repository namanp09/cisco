<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/5ab51c95-4008-49a9-9ef3-ba1730628b6f" />
<img width="1440" height="900" alt="Screenshot 2025-10-15 at 7 40 56 PM" src="https://github.com/user-attachments/assets/8f4d869b-5415-4994-9311-a0bfe7e5d4cb" />
<img width="1440" height="900" alt="Screenshot 2025-10-15 at 7 41 19 PM" src="https://github.com/user-attachments/assets/4b6c4fe9-90cb-4bcd-ba0e-1b87c8e73b52" />

⚙️ Working and Architecture
🧩 System Overview

Expense Splitter Service is a full-stack web application designed to help groups (like friends or roommates) easily manage shared expenses.
It allows users to:

Create and join groups

Add shared expenses

Automatically calculate how much each member owes or is owed

Generate a simple settlement plan to balance all dues

The system is built with a React + Vite frontend and a Node.js + Express + MongoDB backend, using Clerk for authentication.

🧠 High-Level Architecture
        ┌─────────────────────────────┐
        │         Frontend            │
        │  React + Vite + Clerk Auth  │
        │  (client/src/)              │
        └────────────┬────────────────┘
                     │ REST API Calls (Axios / Fetch)
                     ▼
        ┌─────────────────────────────┐
        │         Backend             │
        │  Node.js + Express + MongoDB│
        │  (server/)                  │
        └────────────┬────────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │       MongoDB Atlas         │
        │   (Groups, Expenses, Users) │
        └─────────────────────────────┘

🔐 Authentication Flow (Clerk)

A new user signs up or logs in using Clerk.

Clerk issues a secure JWT session token.

The frontend stores this session and sends it with each API request.

The backend validates the token using the middleware requireAuth() from @clerk/express.

Only authenticated users can create or access groups and expenses.

🧾 Expense Management Workflow

Create Group
A user creates a group (e.g., Trip to Goa) and invites others via their Clerk-registered accounts.

Add Expense
For each shared cost, a user logs:

Description (e.g., Dinner at Café)

Amount paid

Who paid

Who participated

This is sent to the backend via a POST /:groupId/expenses API.

Backend Calculation Logic
The backend stores the expense and updates a running balance for each participant:

If you paid, your balance increases.

If you participated but didn’t pay, your balance decreases.

This logic is handled by group.controller.js and stored in MongoDB using group.model.js.

View Balances
The frontend calls GET /:groupId/balances, which computes each member’s net owed or due amount and returns an easily readable list (e.g., “Alice owes Bob ₹200”).

Settlement Generation (Optional)
A smart algorithm in generateSettlement() (server side) minimizes the number of payments.
For example, if three people owe each other various amounts, it figures out the fewest transactions needed for everyone to be even.

🧮 Example Scenario

Group: “Flatmates”

Expense	Paid By	Shared By	Amount
Groceries	Alice	Alice, Bob, Carol	₹900
Rent	Bob	Bob, Carol	₹1200
Pizza	Carol	All	₹600

Backend Calculation Result:

Member	Net Balance
Alice	+₹150
Bob	+₹50
Carol	-₹200

Settlement Suggestion:

Carol → Alice ₹150

Carol → Bob ₹50

Everyone’s balance is now zero ✅

🧰 Tech Stack Summary
Layer	Technology
Frontend	React (Vite), Clerk Auth
Backend	Node.js, Express.js
Database	MongoDB (via Mongoose)
Auth Middleware	@clerk/express
Deployment	Vercel (frontend), Render/Atlas (backend)
Environment Config	.env files managed per layer
🧪 Testing and Validation

The system was tested with:

Multiple expenses with mixed participants

Edge cases (e.g., one person not included in a particular expense)

Settlement correctness (ensuring the final balances sum to zero)

Authenticated route protection

⚡ Live Interaction Flow

User logs in using Clerk.

User creates a new expense group.

User adds expenses with participants.

Backend updates and recalculates balances.

Frontend displays current balances and generates a settlement plan.

Optionally, user marks payments as “settled.”
