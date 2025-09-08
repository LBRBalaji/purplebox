
# Backend Database Configuration Plan

Here is a clear breakdown of the database requirements and application flows for your platform. This information will serve as a blueprint for configuring your backend database, such as Firestore or any SQL-based system.

---

### 1. Users Database

This table stores information for every individual who registers on the platform.

**Schema/Fields:**

*   `userId` (Primary Key, e.g., UID from Firebase Auth)
*   `email` (Unique Identifier, searchable)
*   `role` (String: "User", "SuperAdmin", "O2O", "Warehouse Developer") - *Crucial for access control.*
*   `plan` (String: "Free", "Paid_Basic", "Paid_Premium") - *Determines feature access, especially for "User" role.*
*   `companyName` (String)
*   `userName` (String)
*   `phone` (String)
*   `createdAt` (Timestamp)

**Application Flow:**

1.  **Registration:** When a user signs up on the **Signup Page**, a new record is created in the `Users` table. Their selected role and default plan ("Free" for customers) determine their permissions.
2.  **Login:** During login, the system fetches the user's record using their email to retrieve their role, plan, and profile information, which is then used to customize the dashboard and enable/disable features.
3.  **User Management:** The main admin uses the **Manage Users** page to view, edit (role and plan), or delete records from this table.

**Privileges by Plan (for "User" role):**
*   **Free:** Can log demands, view matches, and shortlist properties. Downloads are limited (e.g., 5 listings per day, max 2 downloads).
*   **Paid_Basic:** All "Free" features, plus access to advanced features like digital negotiation sheets and tenant improvement tracking. Download limits may be increased.
*   **Paid_Premium:** All "Paid_Basic" features with no download restrictions, plus access to exclusive market analytics or other high-value features.

---

### 2. Demands Database

This table holds all property requirements submitted by customers.

**Schema/Fields:**

*   `demandId` (Primary Key, e.g., "DMD-12345")
*   `userId` (Foreign Key, links to the `Users` table)
*   `status` (String: "Active", "Circulated", "Closed") - *For tracking the demand lifecycle.*
*   `propertyType` (String: "Warehouse", "Industrial Building")
*   `location` (GeoPoint or JSON for lat/lng)
*   `locationName` (String, e.g., "Oragadam, Chennai")
*   `radius` (Number, in km)
*   `size` (Number, in sq. ft.)
*   `description` (Text)
*   `preferences` (JSON/Map for storing priorities like `nonCompromisable` items)
*   `createdAt` (Timestamp)

**Application Flow:**

1.  **Logging a Demand:** A customer fills out the form on the **Log New Demand** tab. On submission, a new record is created in the `Demands` table, linked to their `userId`.
2.  **Displaying Demands:**
    *   **Admins & Providers:** View all "Active" demands on the **Active Demands** tab.
    *   **Customers:** View their own demands on the **My Demands** tab.
3.  **Circulation:** When the admin clicks "Circulate to Providers," the `status` of the demand record can be updated to "Circulated".

---

### 3. Properties Database

This table stores detailed information about every individual warehouse or industrial property available in your system.

**Schema/Fields:**

*   `propertyId` (Primary Key, e.g., "WH-001")
*   `ownerId` (Foreign Key, links to the provider/admin in the `Users` table)
*   `isActive` (Boolean) - *Controls visibility on the public map.*
*   `locationName` (String)
*   `generalizedLocation` (GeoPoint or JSON for lat/lng) - *For map plotting.*
*   `size` (Number, sq. ft.)
*   `readiness` (String)
*   `specifications` (JSON/Map for details like `ceilingHeight`, `docks`, etc.)
*   `imageUrls` (Array of strings)
*   `createdAt` (Timestamp)
*   `updatedAt` (Timestamp)

**Application Flow:**

1.  **Map Search:** The **Map Search** page is dynamic. When a user pans or zooms the map, the frontend sends the visible geographic boundaries (e.g., southwest and northeast coordinates) to the backend. The backend performs a **geospatial query** on the `Properties` table to fetch only the listings where `isActive` is `true` and the `generalizedLocation` falls within those boundaries. This dynamic data is used to generate the heatmap and regional summaries.
2.  **Warehouse Management:** The O2O Manager or Admin uses the **Manage Warehouses** page to create, update, or delete records in this table. Toggling the `isActive` switch updates the corresponding record in the database.

---

### 4. Submissions Database (Junction Table)

This crucial table links `Demands` with `Properties`, representing a specific property submitted as a match for a specific demand.

**Schema/Fields:**

*   `submissionId` (Primary Key)
*   `demandId` (Foreign Key, links to the `Demands` table)
*   `propertyId` (Foreign Key, links to the `Properties` table)
*   `providerId` (Foreign Key, the user who submitted the match)
*   `status` (String: "Pending", "Approved", "Rejected") - *For the approval workflow.*
*   `matchResult` (JSON/Map, stores the AI-generated score breakdown and justification)
*   `submittedAt` (Timestamp)

**Application Flow:**

1.  **Submitting a Match:** A provider selects a demand and fills out the **Property Form**. Upon submission, the AI calculates the match score, and a new record is created in the `Submissions` table with a "Pending" status.
2.  **Approval Queue:** The **Approval Queue** page fetches all submissions where `status` is "Pending". The admin can then update the status to "Approved" or "Rejected".
3.  **Displaying Matches:**
    *   **Customers:** On the **My Demands** page, they see submissions where `demandId` matches their demand AND `status` is "Approved".
    *   **Providers:** On the **My Submissions** page, they see all submissions linked to their `providerId`.

---

### 5. AgentLeads Database

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

**Application Flow:**

1.  **Agent Registration:** A potential partner fills out the form on the **Agent Signup** page, which creates a new record in the `AgentLeads` table with a "Pending" status.
2.  **Admin Review:** The admin views all records from this table in the **Agent Waitlist** tab on the "Manage Users" page. They can then update the `status` of each lead based on their review process.
