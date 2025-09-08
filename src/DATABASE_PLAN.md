
# Backend Database Configuration Plan

Here is a clear breakdown of the database requirements and application flows for your platform. This information will serve as a blueprint for configuring your backend database, such as Firestore or any SQL-based system.

---

### 1. Companies Database

This table stores information for each enterprise/company account.

**Schema/Fields:**

*   `companyId` (Primary Key, e.g., "COMP-12345")
*   `companyName` (String, Unique)
*   `createdAt` (Timestamp)

**Application Flow:**

1.  **Creation:** A new company record is created by a Super Admin when adding the first user for that company.
2.  **Association:** Users are linked to a company via a `companyId` in their user record.

---

### 2. Users Database

This table stores information for every individual who registers on the platform.

**Schema/Fields:**

*   `userId` (Primary Key, e.g., UID from Firebase Auth)
*   `companyId` (Foreign Key, links to the `Companies` table)
*   `email` (Unique Identifier, searchable)
*   `role` (String: "User", "SuperAdmin", "O2O", "Warehouse Developer", "Agent") - *Crucial for access control.*
*   `isCompanyAdmin` (Boolean) - *If true, this user can manage other users within their own company.*
*   `plan` (String: "Free", "Paid_Basic", "Paid_Premium") - *Determines feature access, especially for "User" role.*
*   `companyName` (String) - *Denormalized for easy display.*
*   `userName` (String)
*   `phone` (String)
*   `createdAt` (Timestamp)

**Application Flow:**

1.  **Registration:** When a user signs up on the **Signup Page**, a new record is created. A Super Admin then assigns them to a company.
2.  **Login:** During login, the system fetches the user's record to retrieve their role, plan, and company information.
3.  **User Management:** The Super Admin uses the **Manage Users** page to view, edit, and assign users to companies. They can also designate a user as a `Company Admin`.

---

### 3. Demands Database

This table holds all property requirements submitted by customers.

**Schema/Fields:**

*   `demandId` (Primary Key, e.g., "DMD-12345")
*   `userId` (Foreign Key, links to the `Users` table)
*   `companyId` (Foreign Key, links to the `Companies` table)
*   `status` (String: "Active", "Circulated", "Closed")
*   `propertyType` (String: "Warehouse", "Industrial Building")
*   `location` (GeoPoint or JSON for lat/lng)
*   `locationName` (String)
*   `radius` (Number, in km)
*   `size` (Number, in sq. ft.)
*   `description` (Text)
*   `preferences` (JSON/Map for storing priorities)
*   `createdAt` (Timestamp)

---

### 4. Properties Database

This table stores detailed information about every individual warehouse or industrial property.

**Schema/Fields:**

*   `propertyId` (Primary Key, e.g., "WH-001")
*   `ownerId` (Foreign Key, links to the user in the `Users` table)
*   `companyId` (Foreign Key, links to the `Companies` table)
*   `isActive` (Boolean)
*   `locationName` (String)
*   `generalizedLocation` (GeoPoint or JSON for lat/lng)
*   `size` (Number, sq. ft.)
*   `readiness` (String)
*   `specifications` (JSON/Map)
*   `imageUrls` (Array of strings)
*   `createdAt` (Timestamp)
*   `updatedAt` (Timestamp)

---

### 5. Submissions Database (Junction Table)

This table links `Demands` with `Properties`.

**Schema/Fields:**

*   `submissionId` (Primary Key)
*   `demandId` (Foreign Key, links to `Demands`)
*   `propertyId` (Foreign Key, links to `Properties`)
*   `providerId` (Foreign Key, the user who submitted the match)
*   `status` (String: "Pending", "Approved", "Rejected")
*   `matchResult` (JSON/Map)
*   `submittedAt` (Timestamp)

---

### 6. AgentLeads Database

This table acts as a waitlist for potential agent partners.

**Schema/Fields:**

*   `leadId` (Primary Key)
*   `status` (String: "Pending", "Approved", "Rejected", "Hold")
*   `agentType` (String: "Individual", "Company")
*   `name` (String)
*   `companyName` (String)
*   `email` (String)
*   `phone` (String)
*   `address` (Text)
*   `socialProfileId` (String)
*   `submittedAt` (Timestamp)
