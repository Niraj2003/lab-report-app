# Lab Report Desktop Application --- Complete Documentation

## 1. Document Overview

**Application:** Lab Report Desktop Application\
**Platform:** Windows desktop\
**Architecture:** Offline-first Electron desktop application\
**Frontend:** React + TypeScript + Vite\
**Desktop runtime:** Electron\
**Database:** SQLite using `better-sqlite3`\
**Storage model:** Local files only; no hosted database or application
server is required.

### Primary purpose

The application is designed for a diagnostic/laboratory workflow in
which staff enter patient information and report values, save the
information locally, search historical reports, print reports on
pre-printed laboratory stationery, and manage invoices.

The application is intentionally structured around a **Universal Report
Editor + configurable Report Definitions + separate Print Templates**
rather than maintaining a separate hard-coded screen for every report.

------------------------------------------------------------------------

# 2. Business Requirements

## 2.1 Core requirements

The application must allow laboratory staff to:

1.  Create a patient/report.
2.  Select a report type.
3.  Enter patient information.
4.  Enter report-specific values.
5.  Validate entered values.
6.  Save the report locally.
7.  Print the report.
8.  Search historical reports by patient name.
9.  Reprint existing reports.
10. Allow administrators to edit previously saved reports.
11. Create and manage invoices.
12. Maintain a Test Master with prices.
13. Configure report fields and labels.
14. Calibrate print positions.
15. Back up and restore the local database.
16. Archive old reports according to a configurable retention period.

## 2.2 Offline requirement

The application does not depend on:

-   Internet connectivity
-   A cloud database
-   A remote API
-   A hosted backend
-   Firebase
-   Supabase
-   MySQL/PostgreSQL server

The SQLite database is stored on the local machine.

------------------------------------------------------------------------

# 3. Supported Report Types

The current report definition model contains the following report types:

  Code        Report
  ----------- ----------------
  `sero`      Serology
  `haemo`     Haemogram
  `bs`        Blood Sugar
  `biochem`   Bio-Chemistry
  `crpra`     CRP / RA
  `bill`      Bill / Invoice

Each report has a definition describing its fields and a print template
describing its physical print positioning.

------------------------------------------------------------------------

# 4. Patient Information

Common patient fields are:

-   Patient name
-   Age
-   Sex
-   Report date
-   Referring doctor

The patient number is generated automatically.

Example:

``` text
P000001
P000002
P000003
```

## 4.1 Patient matching

The current design reuses a patient when the following combination
matches:

``` text
Patient Name + Sex
```

Comparison is case-insensitive.

When an existing patient is found:

-   the patient record is reused;
-   age can be updated;
-   referring doctor can be updated.

If no matching patient exists, a new patient number is generated.

### Important consideration

Name + sex is not a globally unique patient identity. Two different
people with the same name and sex can therefore be treated as the same
patient.

If stronger identification is required in a future version, additional
fields such as:

-   date of birth;
-   mobile number;
-   patient registration number;
-   address;

can be introduced.

------------------------------------------------------------------------

# 5. Universal Report Editor

The application uses a single report-entry interface.

The user selects:

``` text
Report Type
```

The application then loads the corresponding report definition.

Conceptually:

``` text
Universal Report Editor
        |
        +---- Serology Definition
        |
        +---- Haemogram Definition
        |
        +---- Blood Sugar Definition
        |
        +---- Bio-Chemistry Definition
        |
        +---- CRP / RA Definition
        |
        +---- Bill Definition
```

This avoids maintaining six independent React forms.

------------------------------------------------------------------------

# 6. Report Definition

A **Report Definition** describes what a report contains.

It is separate from report data and print positioning.

A definition can contain:

-   report code;
-   display name;
-   paper size;
-   orientation;
-   sections;
-   fields;
-   field type;
-   label;
-   unit;
-   default value;
-   required status;
-   printable status;
-   validation rules.

## 6.1 Field types

The supported field types are:

-   `text`
-   `number`
-   `decimal`
-   `dropdown`
-   `date`
-   `textarea`
-   `section`
-   `calculated`

Example:

``` text
Field:
    key: hb
    label: Hemoglobin
    type: decimal
    unit: g/dL
    required: false
    printable: true
```

------------------------------------------------------------------------

# 7. Serology

The Serology report contains:

-   HBsAg
-   HIV
-   HCV

Configured result options include:

### HBsAg

``` text
NEGATIVE
POSITIVE
NOT_TESTED
```

### HIV

``` text
NON-REACTIVE
REACTIVE
NOT_TESTED
```

### HCV

``` text
NEGATIVE
POSITIVE
NOT_TESTED
```

The old application also supported configurable serology methods/notes.
The new application architecture reserves administrative configuration
for report definitions and settings.

------------------------------------------------------------------------

# 8. Haemogram

The Haemogram report contains the following major fields:

-   Hemoglobin
-   WBC
-   ESR
-   Neutrophils
-   Lymphocytes
-   Eosinophils
-   Monocytes
-   Basophils
-   Platelets
-   Blood sugar
-   Albumin
-   Urine sugar
-   Microscopy
-   Bleeding Time
-   Clotting Time
-   HCV
-   AAT
-   HIV

## 8.1 Differential validation

The differential count must satisfy:

``` text
Neutrophils
+ Lymphocytes
+ Eosinophils
+ Monocytes
+ Basophils
= 100
```

If the differential values are entered, the application validates the
total.

Example:

``` text
60 + 30 + 3 + 5 + 2 = 100
```

is valid.

``` text
60 + 30 + 3 + 5 + 3 = 101
```

is invalid.

------------------------------------------------------------------------

# 9. Blood Sugar

The Blood Sugar report supports:

## Random

-   Value
-   Urine sugar
-   Ketone

## Fasting

-   Value
-   Urine sugar
-   Ketone

## Post-prandial

-   Value
-   Urine sugar
-   Ketone

The report definition allows the values to be stored as structured
report data.

------------------------------------------------------------------------

# 10. Bio-Chemistry

The Bio-Chemistry report includes:

-   Urea
-   Creatinine
-   Uric Acid
-   Total Bilirubin
-   Direct Bilirubin
-   Indirect Bilirubin
-   SGOT
-   SGPT
-   Cholesterol
-   Triglycerides
-   HDL
-   LDL

Units and labels are part of the report definition.

------------------------------------------------------------------------

# 11. CRP / RA

The CRP / RA report contains:

-   CRP
-   RA

The configured values are numeric fields with units.

------------------------------------------------------------------------

# 12. Billing and Invoice

The application contains a separate invoice workflow.

## 12.1 Test Master

Tests are maintained in the Test Master.

Example initial entries:

  Test              Price
  --------------- -------
  CBC                ₹300
  Blood Sugar        ₹150
  LFT                ₹500
  Lipid Profile      ₹600
  CRP                ₹250

The Test Master supports:

-   Add test
-   Edit test
-   Change price
-   Disable test

Disabled tests can remain in historical invoice data without being
offered as active tests for new invoices.

## 12.2 Invoice workflow

Typical workflow:

``` text
Select Patient
     |
Select Test
     |
Automatic Test Price
     |
Optional Price Override
     |
Add More Tests
     |
Apply Discount
     |
Calculate Total
     |
Save Invoice
     |
Print Invoice
```

## 12.3 Price override

The Test Master price is used as the default.

A user can override the price for a specific invoice item without
changing the master price.

## 12.4 Discount

Invoice total is calculated as:

``` text
Subtotal = Sum(Item Prices)

Total = Subtotal - Discount
```

The saved invoice retains its own item prices and discount.

------------------------------------------------------------------------

# 13. Report Numbers

Reports receive automatically generated report numbers.

Format:

``` text
R-YYYY-000001
```

Example:

``` text
R-2026-000001
R-2026-000002
```

The sequence is generated locally by the SQLite database.

------------------------------------------------------------------------

# 14. Invoice Numbers

Invoices receive automatically generated invoice numbers.

Format:

``` text
INV-YYYY-000001
```

Example:

``` text
INV-2026-000001
```

------------------------------------------------------------------------

# 15. Database Architecture

SQLite is the primary persistent data store.

The application uses:

``` text
better-sqlite3
```

The database is stored under Electron's application user-data directory.

No database server is required.

------------------------------------------------------------------------

# 16. Database Tables

The planned/current database model contains:

``` text
patients
reports
report_definitions
print_templates
test_master
invoices
settings
audit
```

## 16.1 patients

Stores patient identity information.

Conceptual fields:

``` text
id
patient_number
name
age
sex
referring
created_at
updated_at
```

## 16.2 reports

Stores actual report records.

Conceptual fields:

``` text
id
report_number
patient_id
report_code
version
report_date
data
created_at
updated_at
```

The report values are stored as structured JSON data associated with the
report definition.

The report version is retained so that historical reports can remain
associated with the definition version used when they were created.

## 16.3 report_definitions

Stores configurable report definitions.

Conceptual information:

``` text
report code
version
definition JSON
updated timestamp
```

## 16.4 print_templates

Stores physical printing configuration.

Conceptual fields:

``` text
report_code
paper_size
orientation
top_mm
bottom_mm
left_mm
right_mm
scale
```

## 16.5 test_master

Stores available laboratory tests and their prices.

## 16.6 invoices

Stores invoice header and line-item information.

## 16.7 settings

Stores application-level configuration.

Examples:

``` text
admin_pin
retention_months
auto_backup
last_auto_backup
```

## 16.8 audit

Stores sensitive operations such as:

``` text
CREATE
UPDATE
DELETE
```

where applicable.

------------------------------------------------------------------------

# 17. Report Data vs Report Definition vs Print Template

These three concepts must remain separate.

## Report Definition

Answers:

> What fields does this report contain?

Example:

``` text
Hemoglobin
WBC
ESR
Platelets
```

## Report Data

Answers:

> What values were entered for this particular patient?

Example:

``` text
Hemoglobin = 13.4
WBC = 7200
ESR = 12
Platelets = 250000
```

## Print Template

Answers:

> Where should those values appear on the physical paper?

Example:

``` text
Top offset = 48 mm
Left offset = 7 mm
Right offset = 7 mm
```

Keeping these independent makes the application easier to maintain.

------------------------------------------------------------------------

# 18. Printing Architecture

Printing is designed for a laboratory that already has pre-printed
letterhead/stationery.

Therefore the application should print only dynamic report content.

It should NOT reproduce:

-   laboratory logo;
-   laboratory header;
-   pre-printed footer;
-   fixed stationery artwork.

The print page uses:

``` css
@page {
    margin: 0;
}
```

and the report content is positioned using configured millimetre
offsets.

------------------------------------------------------------------------

# 19. Initial Print Calibration

The initial print calibration values are based on the existing
application's configuration.

  Report          Paper     Top   Bottom   Left   Right   Scale
  --------------- ------- ----- -------- ------ ------- -------
  Serology        A4         48        0      8       8    100%
  Haemogram       A4         48        0      7       7    100%
  Blood Sugar     A5         48       15     11       5    100%
  Bio-Chemistry   A4         48       15     23      23    100%
  CRP / RA        A4         47       15     23      23    100%
  Bill            A4         48       15     20      19    100%

All values are configurable from the Admin area.

These are starting values and must be physically tested against the
actual printer and pre-printed stationery.

------------------------------------------------------------------------

# 20. A4 and A5 Printing

The application supports:

``` text
A4
A5
```

The print template determines the required paper size.

The printer itself can be configured separately at the
operating-system/printer level.

The application passes the selected paper size to Electron's printing
API.

------------------------------------------------------------------------

# 21. Print Calibration

Administrator workflow:

``` text
Admin
  -> Print Layouts / Calibration
  -> Select Report
  -> Select Paper Size
  -> Change offsets
  -> Change scale
  -> Save
```

Parameters:

-   Top margin/offset
-   Bottom margin/offset
-   Left margin/offset
-   Right margin/offset
-   Scale
-   Paper size
-   Orientation

## Calibration procedure

1.  Load the correct pre-printed stationery.
2.  Print a sample.
3.  Compare the dynamic content with the stationery.
4.  Adjust top/left/right/bottom offsets.
5.  Adjust scale if required.
6.  Print another sample.
7.  Save the final calibration.

------------------------------------------------------------------------

# 22. Application UI

The primary application contains four major areas.

## 22.1 New Report

Used for creating and printing reports.

Main flow:

``` text
Select Report Type
        |
Patient Details
        |
Report Fields
        |
Validation
        |
Preview
        |
Save
        |
Print
```

## 22.2 History

Used for searching previously saved reports.

Primary search:

``` text
Patient Name
```

Additional filtering can include:

-   Report type
-   Date

History is sorted newest first.

Normal users can:

-   view/reprint reports.

Administrators can additionally:

-   edit reports;
-   delete reports where permitted.

## 22.3 Invoices

Used to:

-   create invoices;
-   add tests;
-   change individual prices;
-   apply discounts;
-   save;
-   print;
-   reprint historical invoices.

## 22.4 Admin

Contains sensitive configuration.

------------------------------------------------------------------------

# 23. Administrator Access

Administrative functionality is protected by an Admin PIN.

The initial development/default PIN is:

``` text
1234
```

This should be changed before production use.

Administrator functionality includes:

-   report definition management;
-   print calibration;
-   Test Master;
-   settings;
-   backup;
-   restore;
-   retention/archive;
-   sensitive report editing.

------------------------------------------------------------------------

# 24. Report Template Administration

The Admin report-template editor provides a structured editor rather
than an arbitrary drag-and-drop document editor.

An administrator can configure existing report definitions, including:

-   section title;
-   field label;
-   field type;
-   unit;
-   required flag;
-   printable flag.

The application uses versioning for report definitions.

This is important because previously saved reports should not silently
change when an administrator modifies the current template.

------------------------------------------------------------------------

# 25. Report Versioning

Example:

``` text
Haemogram version 1
Haemogram version 2
```

A new report created after version 2 uses version 2.

A historical report created using version 1 retains its original version
reference.

This prevents template changes from corrupting the interpretation of
historical data.

------------------------------------------------------------------------

# 26. Validation

Validation is performed before saving a report.

Typical validation includes:

-   required fields;
-   numeric fields;
-   decimal fields;
-   dropdown values;
-   report-specific business rules.

Haemogram differential validation is a specific example:

``` text
Neutrophils + Lymphocytes + Eosinophils
+ Monocytes + Basophils = 100
```

------------------------------------------------------------------------

# 27. Preview

The New Report screen provides a preview of the report before printing.

The preview is intended to provide a visual representation of the report
content.

The actual physical print position is controlled by the Print Template.

------------------------------------------------------------------------

# 28. Security Model

The application is local/offline, so its primary security boundary is
the computer on which it is installed.

Administrative operations are protected by an application-level PIN.

Sensitive operations should be recorded in the audit table.

The application should additionally rely on:

-   Windows user access controls;
-   disk permissions;
-   regular backups;
-   controlled access to the workstation.

The application does not currently implement a multi-user server
authentication system.

------------------------------------------------------------------------

# 29. Backup

The application supports manual database backup.

A backup is a copy of the SQLite database.

Example conceptual file:

``` text
auto-backup-2026-09-22.sqlite
```

## 29.1 Automatic backup

Automatic backup can run once per day.

The application records the last automatic backup date.

The automatic backup is stored under the application's user-data backup
location.

## 29.2 Manual backup

Administrator:

``` text
Admin
 -> Backup
 -> Choose destination
 -> Save SQLite backup
```

------------------------------------------------------------------------

# 30. Restore

Administrator can select a SQLite backup and restore it.

Restore workflow:

``` text
Select Backup
     |
Close current DB
     |
Replace database
     |
Reopen database
     |
Continue application
```

A restore should always be performed carefully because it replaces the
current local database state.

A backup of the current database should ideally be taken before
restoring an older backup.

------------------------------------------------------------------------

# 31. Data Retention

Default retention is:

``` text
6 months
```

The retention period is configurable.

Old reports can be archived to JSON files before deletion.

Conceptually:

``` text
Current Database
       |
Reports older than retention period
       |
Archive JSON
       |
Delete old records
```

The current implementation archives reports; invoices/patients are not
automatically archived by the same process.

------------------------------------------------------------------------

# 32. Audit Trail

Administrative/sensitive operations are recorded in the audit table.

Examples:

``` text
CREATE REPORT
UPDATE REPORT
DELETE REPORT
```

The purpose is to provide a local record of important changes.

------------------------------------------------------------------------

# 33. Electron Architecture

The application follows Electron's separation of responsibilities.

``` text
+--------------------------------------------------+
|                  Electron App                    |
|                                                  |
|  +-------------+       +----------------------+  |
|  | React UI    | <---> | Preload API          |  |
|  | Renderer    |       | Context Bridge       |  |
|  +-------------+       +----------+-----------+  |
|                                     |             |
|                                     v             |
|                           +-------------------+   |
|                           | Electron Main     |   |
|                           | IPC handlers      |   |
|                           +---------+---------+   |
|                                     |             |
|                                     v             |
|                           +-------------------+   |
|                           | SQLite            |   |
|                           | better-sqlite3    |   |
|                           +-------------------+   |
+--------------------------------------------------+
```

------------------------------------------------------------------------

# 34. Renderer Process

The renderer contains:

``` text
React
TypeScript
Vite
CSS
```

Responsibilities:

-   display UI;
-   collect form values;
-   display history;
-   display invoice screens;
-   display admin screens;
-   request operations through the preload API.

The renderer should not directly access SQLite.

------------------------------------------------------------------------

# 35. Preload Process

The preload layer exposes a controlled API to the renderer.

Conceptually:

``` text
window.labApi
```

Examples of API categories:

``` text
Reports
Patients
Definitions
Print Templates
Test Master
Invoices
Settings
Backup
Restore
Archive
Printing
```

The preload layer acts as the security boundary between the renderer and
Electron main process.

------------------------------------------------------------------------

# 36. Main Process

The Electron main process is responsible for:

-   application window;
-   SQLite access;
-   IPC handlers;
-   printing;
-   backup;
-   restore;
-   retention/archive;
-   application startup.

The main process can access Node.js APIs.

------------------------------------------------------------------------

# 37. Database Module

`db.ts` is responsible for database operations.

Responsibilities include:

-   initialize SQLite;
-   create tables;
-   seed default definitions;
-   seed print templates;
-   seed Test Master;
-   create/update patients;
-   save reports;
-   retrieve history;
-   save invoices;
-   manage settings;
-   backup;
-   restore;
-   archive;
-   audit.

------------------------------------------------------------------------

# 38. Frontend Definition Module

The report definitions are represented in:

``` text
src/renderer/data/definitions.ts
```

This contains the initial report structures.

The definition contains the metadata necessary for the universal editor.

------------------------------------------------------------------------

# 39. Shared Type Definitions

Shared TypeScript types are kept separately.

Examples include:

``` text
FieldType
PaperSize
ReportField
ReportSection
Rule
ReportDefinition
PrintTemplate
Patient
ReportRecord
TestItem
InvoiceItem
Invoice
```

This allows the renderer and Electron-side code to use a consistent data
model.

------------------------------------------------------------------------

# 40. Project Structure

Recommended project structure:

``` text
lab-report-app/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── README.md
│
├── src/
│   │
│   ├── main/
│   │   ├── main.ts
│   │   └── db.ts
│   │
│   ├── preload/
│   │   └── preload.ts
│   │
│   ├── shared/
│   │   └── types.ts
│   │
│   └── renderer/
│       ├── main.tsx
│       ├── style.css
│       ├── vite-env.d.ts
│       │
│       └── data/
│           └── definitions.ts
│
└── assets/
```

------------------------------------------------------------------------

# 41. Technology Stack

  Component           Technology
  ------------------- --------------------------------
  Desktop framework   Electron
  UI                  React
  Language            TypeScript
  Bundler             Vite
  Database            SQLite
  SQLite driver       better-sqlite3
  Styling             CSS
  Printing            Electron `webContents.print()`
  Packaging           electron-builder

------------------------------------------------------------------------

# 42. Development Setup

Install Node.js on the development machine.

From the project directory:

``` bash
npm install
```

Then start development:

``` bash
npm run dev
```

The development command starts:

1.  TypeScript compilation for Electron-side code;
2.  Vite development server;
3.  Electron.

------------------------------------------------------------------------

# 43. Production Build

Production build:

``` bash
npm run build
```

The build process performs:

``` text
TypeScript compilation
        |
Vite production build
        |
electron-builder packaging
```

The packaged Windows installer is generated by electron-builder.

------------------------------------------------------------------------

# 44. Electron Entry Point

The `package.json` Electron entry point must point to the compiled
main-process JavaScript file.

Expected structure:

``` json
{
  "main": "dist-electron/main/main.js"
}
```

The source file is:

``` text
src/main/main.ts
```

and TypeScript compiles it to:

``` text
dist-electron/main/main.js
```

------------------------------------------------------------------------

# 45. Preload Build Output

Source:

``` text
src/preload/preload.ts
```

Compiled output:

``` text
dist-electron/preload/preload.js
```

The Electron main process should load the preload file relative to its
compiled location:

``` text
../preload/preload.js
```

------------------------------------------------------------------------

# 46. Renderer Build

The React renderer is handled by Vite.

The renderer entry point is:

``` text
src/renderer/main.tsx
```

The CSS file is:

``` text
src/renderer/style.css
```

The Vite TypeScript declaration file should support CSS imports:

``` text
src/renderer/vite-env.d.ts
```

Example declaration:

``` ts
/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}
```

------------------------------------------------------------------------

# 47. Common Build Errors

## Error: Cannot find module or type declarations for `./style.css`

Check:

``` text
src/renderer/style.css
```

exists.

Also check:

``` text
src/renderer/vite-env.d.ts
```

contains the Vite reference and CSS module declaration.

------------------------------------------------------------------------

## Error: Cannot find module `dist-electron/main/main.js`

Check `package.json`:

``` json
"main": "dist-electron/main/main.js"
```

Then delete old build output:

``` cmd
rmdir /s /q dist-electron
rmdir /s /q dist
```

and rebuild:

``` cmd
npm run build
```

Confirm:

``` text
dist-electron/main/main.js
```

exists.

------------------------------------------------------------------------

# 48. Installation Workflow for End Users

A production user should receive the Windows installer produced by
electron-builder.

Typical process:

``` text
Install application
       |
Launch application
       |
SQLite database automatically initialized
       |
Default report definitions loaded
       |
Default print templates loaded
       |
Test Master initialized
       |
Application ready
```

No database server installation should be necessary.

------------------------------------------------------------------------

# 49. First-Time Setup

After installation:

## Step 1 --- Change Admin PIN

Go to:

``` text
Admin
 -> Settings
 -> Admin PIN
```

Do not leave the default PIN in production.

## Step 2 --- Verify Test Master

Review:

``` text
Admin
 -> Test Master
```

Update test names and prices.

## Step 3 --- Verify Report Templates

Review:

``` text
Admin
 -> Report Templates
```

Confirm field labels, units and printable fields.

## Step 4 --- Calibrate Printing

Go to:

``` text
Admin
 -> Print Layouts / Calibration
```

Print test reports on the actual stationery.

## Step 5 --- Configure Retention

Set the required retention period.

## Step 6 --- Create a Backup

Take a manual database backup before production use.

------------------------------------------------------------------------

# 50. Normal Daily Workflow

A typical operator workflow is:

``` text
Open application
      |
New Report
      |
Select report
      |
Enter patient details
      |
Enter results
      |
Review preview
      |
Save & Print
      |
Report printed
```

For an existing patient:

``` text
Enter patient name + sex
      |
Existing patient matched
      |
Reuse patient
      |
Create new report
```

------------------------------------------------------------------------

# 51. Reprinting an Existing Report

Workflow:

``` text
History
   |
Search patient name
   |
Select report
   |
Reprint
```

Normal users can reprint without editing the stored report.

------------------------------------------------------------------------

# 52. Editing a Saved Report

Editing a previously saved report is an administrative action.

Workflow:

``` text
History
   |
Select report
   |
Admin authentication
   |
Edit
   |
Validate
   |
Save
   |
Audit entry
```

This prevents normal users from silently modifying historical records.

------------------------------------------------------------------------

# 53. Data Safety Recommendations

Because the application is local-only, operational backup is important.

Recommended practice:

``` text
Daily automatic backup
+
Periodic manual backup
+
Copy backups to another physical location
```

The application itself does not provide cloud synchronization.

A database backup file should not be considered safe merely because it
exists on the same computer as the primary database.

------------------------------------------------------------------------

# 54. Printing Troubleshooting

If content is too low:

``` text
Reduce top offset
```

If content is too high:

``` text
Increase top offset
```

If content is too far right:

``` text
Increase left offset only if the layout model requires it;
otherwise adjust the relevant content width/position.
```

If content is too far left:

``` text
Adjust left/right offsets.
```

If content is too large:

``` text
Reduce scale.
```

If content is too small:

``` text
Increase scale.
```

Always validate using the actual printer and actual laboratory
stationery.

------------------------------------------------------------------------

# 55. Data Migration From the Old Application

The old application is an HTML/localStorage-style application with
report-specific forms.

The new application uses SQLite and a structured report model.

The old application contained report-specific fields such as:

``` text
Serology:
sf-name
sf-date
sf-sex
sf-ref
sf-hbsag
sf-hiv
sf-hcv
```

Haemogram:

``` text
hf-name
hf-date
hf-sex
hf-ref
hf-hb
hf-wbc
hf-esr
hf-neut
hf-lymp
hf-eosi
hf-mono
hf-baso
hf-plat
hf-plat-unit
hf-sugar
hf-alb
hf-usg
hf-mic
hf-bt
hf-ct
hf-hcv
hf-aat
hf-hiv
```

Blood Sugar:

``` text
bsf-name
bsf-date
bsf-sex
bsf-ref
bsf-r-val
bsf-r-usg
bsf-r-ket
bsf-f-val
bsf-f-usg
bsf-f-ket
bsf-p-val
bsf-p-usg
bsf-p-ket
```

Bio-Chemistry:

``` text
urea
creat
uric
bil-total
bil-direct
bil-indirect
sgot
sgpt
chol
trig
hdl
ldl
```

CRP/RA:

``` text
cf-name
cf-date
cf-sex
cf-ref
cf-crp
cf-ra
```

The new system maps these concepts into report definitions and
structured report data.

A direct old-database migration is not currently defined because the old
application and new application use different storage models.

------------------------------------------------------------------------

# 56. Important Implementation Limitations

The current architecture and initial implementation should be understood
with the following limitations.

## 56.1 Physical print layout

Initial print offsets are based on the old application's known
configuration.

Exact final positioning requires physical printer testing.

## 56.2 Exact old visual design

The universal report renderer provides structured report output, but it
does not automatically reproduce every pixel of the old HTML
application's report-specific visual layout.

If exact legacy reproduction is required, each report's print template
can be made more specific.

## 56.3 Admin report builder

The structured editor is designed around existing fields and sections.

It is not a full arbitrary drag-and-drop report designer.

## 56.4 Patient matching

Current matching uses:

``` text
name + sex
```

This is convenient but not a guaranteed unique patient identity.

## 56.5 Retention

The current archive mechanism is primarily report-oriented. Invoice and
patient retention should be designed separately if regulatory/business
requirements require it.

## 56.6 Native SQLite dependency

`better-sqlite3` contains native components. Electron packaging/build
environments may require appropriate native-module handling/rebuild
configuration.

------------------------------------------------------------------------

# 57. Future Enhancements

Possible future versions can add:

## Patient management

-   DOB
-   mobile number
-   address
-   unique registration number
-   patient search by ID

## Reporting

-   exact legacy print layouts
-   configurable reference ranges
-   abnormal-value highlighting
-   calculated fields
-   more report types
-   report cloning

## Billing

-   GST/tax support
-   payment status
-   receipt printing
-   invoice cancellation
-   payment history

## Administration

-   multiple admin users
-   operator accounts
-   role-based permissions
-   stronger authentication
-   detailed audit viewer

## Backup

-   scheduled external backup
-   encrypted backup
-   backup verification
-   backup history

## Printing

-   printer selection
-   print test page
-   calibration ruler
-   print preview with exact paper dimensions
-   separate templates for different printers

## Data

-   CSV export
-   PDF export
-   Excel export
-   database health check
-   archive browser

------------------------------------------------------------------------

# 58. Recommended Production Checklist

Before using the application in a real laboratory:

### Application

-   [ ] Install production build.
-   [ ] Verify database creation.
-   [ ] Verify all six report types.
-   [ ] Verify patient creation.
-   [ ] Verify existing patient reuse.
-   [ ] Verify report saving.
-   [ ] Verify history.
-   [ ] Verify reprinting.
-   [ ] Verify Admin authentication.

### Reports

-   [ ] Verify Serology.
-   [ ] Verify Haemogram.
-   [ ] Verify Blood Sugar.
-   [ ] Verify Bio-Chemistry.
-   [ ] Verify CRP / RA.
-   [ ] Verify Invoice.

### Validation

-   [ ] Test required fields.
-   [ ] Test numeric fields.
-   [ ] Test dropdowns.
-   [ ] Test haemogram differential = 100 rule.
-   [ ] Test invoice discount.
-   [ ] Test price override.

### Printing

-   [ ] Test A4.
-   [ ] Test A5.
-   [ ] Test every report type.
-   [ ] Test actual laboratory printer.
-   [ ] Test actual pre-printed stationery.
-   [ ] Verify top position.
-   [ ] Verify left/right alignment.
-   [ ] Verify scale.
-   [ ] Verify page orientation.

### Administration

-   [ ] Change default Admin PIN.
-   [ ] Configure Test Master.
-   [ ] Verify report definitions.
-   [ ] Configure retention.
-   [ ] Perform manual backup.
-   [ ] Test restore.
-   [ ] Verify audit entries.

### Data safety

-   [ ] Enable automatic backup.
-   [ ] Confirm backup location.
-   [ ] Test opening a backup.
-   [ ] Store an additional copy outside the computer.

------------------------------------------------------------------------

# 59. Acceptance Test Plan

## Test 1 --- New patient

Expected:

``` text
New Report
 -> enter patient
 -> save
```

Result:

-   patient created;
-   patient number generated;
-   report number generated;
-   report saved.

## Test 2 --- Existing patient

Enter same:

``` text
name + sex
```

Expected:

-   existing patient reused;
-   new report created;
-   patient demographic fields updated where applicable.

## Test 3 --- Haemogram validation

Enter:

``` text
60
30
3
5
2
```

Expected:

``` text
Total = 100
```

Then change one value so total becomes 101.

Expected:

``` text
Validation failure
```

## Test 4 --- History

Search by patient name.

Expected:

-   matching reports appear;
-   newest report appears first.

## Test 5 --- Reprint

Select historical report and print.

Expected:

-   report prints using its stored report data and current applicable
    print configuration.

## Test 6 --- Invoice

Add:

``` text
CBC ₹300
Blood Sugar ₹150
```

Subtotal:

``` text
₹450
```

Apply ₹50 discount.

Expected:

``` text
₹400
```

## Test 7 --- Price override

Change CBC price for one invoice to ₹250.

Expected:

-   current invoice uses ₹250;
-   Test Master remains unchanged.

## Test 8 --- Backup

Create backup.

Expected:

-   SQLite backup file is created.

## Test 9 --- Restore

Restore a known backup.

Expected:

-   previous database state is restored.

## Test 10 --- Admin protection

Attempt an administrative operation without Admin authentication.

Expected:

-   operation is blocked.

------------------------------------------------------------------------

# 60. Operational Summary

The complete application can be summarized as:

``` text
                         LAB REPORT DESKTOP
                                |
        +-----------------------+------------------------+
        |                       |                        |
    New Report              History                 Invoices
        |                       |                        |
   Select Report          Search Patient           Select Test
        |                       |                        |
 Patient Details          View Report              Price
        |                       |                        |
 Report Fields            Reprint/Edit             Discount
        |                       |                        |
 Validation                Admin Check              Save
        |                       |                        |
 Save                     Audit                     Print
        |
 Print
        |
   A4 / A5
        |
 Pre-printed stationery


                         ADMIN
                           |
       +-------------------+-------------------+
       |                   |                   |
 Report Templates   Print Calibration    Test Master
       |                   |                   |
 Definitions          A4/A5 offsets        Prices
       |
       +-------------------+-------------------+
                           |
                     Settings
                           |
              +------------+------------+
              |                         |
         Retention                Admin PIN
              |
          Archive


                         STORAGE
                           |
                    SQLite Database
                           |
        +------------------+------------------+
        |                  |                  |
     Patients           Reports            Invoices
        |                  |                  |
        +------------------+------------------+
                           |
                        Backup
                           |
                    SQLite Backup
```

------------------------------------------------------------------------

# 61. Final Architecture Principle

The most important design rule for the application is:

> **Report Definition, Report Data, and Print Layout are three separate
> concerns.**

This allows the laboratory to change:

-   what fields a report contains;
-   what values a patient has;
-   where those values print;

without coupling all three parts together.

The application therefore remains suitable for adding future laboratory
reports without creating a completely new screen and database structure
for every report.

------------------------------------------------------------------------

# 62. Current Status

The application design covers:

-   offline Electron desktop operation;
-   SQLite persistence;
-   universal report editor;
-   six report/report-billing types;
-   patient management;
-   report history;
-   admin access;
-   configurable report definitions;
-   print calibration;
-   A4/A5 printing;
-   Test Master;
-   invoice management;
-   backup/restore;
-   retention/archive;
-   audit logging.

The remaining production-readiness work is primarily implementation
verification, exact print-layout calibration, testing, and resolving any
TypeScript/Electron build issues in the local project environment.
