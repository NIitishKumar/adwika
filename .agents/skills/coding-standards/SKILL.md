React Architecture Standards
Technology Stack
React with TypeScript.
shadcn/ui for UI primitives.
Tailwind CSS for styling, following existing project conventions.
Formik for all new form state management and submission handling.
Zod for form validation and schema definitions.
Use the project's existing routing, state management, API client, and testing libraries.
Do not introduce competing libraries without explicit approval.
1. Feature-First Architecture
Organize business functionality inside src/features/<feature-name>/.
Every feature must have a root component or entry module appropriate to its purpose.
Keep feature-specific components, hooks, types, constants, schemas, utilities, services, and tests within the owning feature.
Create only the directories needed for the feature.
Keep global application setup inside src/app/.
Keep global state infrastructure inside src/store/.
Keep reusable hooks, types, constants, utilities, and services in shared directories only when genuinely shared.
Inspect the existing repository before creating or moving files.
2. Shared Components and Fields
Keep shadcn/ui primitives inside src/components/ui/.
Keep reusable application components inside src/components/common/.
Keep reusable Formik-connected fields inside src/components/common/fields/.
Compose shared fields from shadcn/ui primitives instead of duplicating their behavior.
Before creating a field, check whether an existing field already meets the requirement.
Keep shared fields independent of feature-specific business logic.
Use strongly typed props; avoid any.
Maintain consistent labels, descriptions, validation messages, disabled states, accessibility, and styling.
Do not create every possible field in advance. Add fields when needed.
3. Mandatory Formik and Zod Rules
Use Formik for every new form.
Use Zod schemas for validation.
Integrate Zod with Formik through the shared adapter in src/lib/validation/zod-formik.ts.
Do not use Yup or introduce another form management library for new forms.
Use Formik's values, errors, touched, isSubmitting, and submission helpers.
Avoid duplicating Formik-managed values in React local state.
Keep feature-specific validation schemas with their owning feature.
Infer TypeScript types from Zod schemas where practical.
Handle server-side errors separately from client-side schema validation.
Disable duplicate submission while a form is submitting.
Do not reset form values unless the intended behavior requires it.
Validate server-side as well; client-side validation is not a security boundary.
4. Shared Field API
Fields must accept a Formik name prop and connect to Formik automatically.
Use useField or an appropriate Formik helper to read and update field state.
Use shadcn/ui components for rendering.
Show field validation errors when the field is touched or after the appropriate form submission attempt, following the project's UX convention.
Support accessible labels, helper descriptions, required indicators, disabled states, and field-specific attributes.
Use appropriate value handling for text, number, checkbox, radio, select, date, and file inputs.
Do not put business-specific validation rules inside common fields.
5. Feature Directory Convention

Use this layout as a guide:

src/features/<feature-name>/
├── index.ts
├── <FeatureName>.tsx
├── components/
├── hooks/
├── types/
├── constants/
├── utils/
├── services/
├── schemas/
└── tests/


For a form:

components/<Feature>Form/
├── <Feature>Form.tsx
├── <Feature>Form.types.ts
├── <Feature>Form.schema.ts
└── index.ts


Omit redundant files. For example, do not create a separate types file for a tiny component when the types are simple and used only there.

6. Feature Root Exports
Every feature must expose its intended public API through its root index.ts.
Cross-feature imports must use the target feature's public entry point.
Never deep-import another feature's internal implementation.
Internal files within the same feature may use direct relative imports.
Avoid circular dependencies and unnecessary re-exports.
Export only symbols that consumers need.
7. shadcn/ui Conventions
Reuse existing shadcn/ui primitives from @/components/ui/.
Do not replace existing primitives with another component library.
Use the existing cn() utility for conditional class names where appropriate.
Follow the project's Tailwind configuration and design tokens.
Preserve keyboard navigation, focus visibility, accessible names, and ARIA semantics.
Do not edit generated UI primitives unnecessarily to implement a feature-specific requirement.
8. Naming Conventions
React components: PascalCase.
Custom hooks: camelCase with the use prefix.
Variables and functions: camelCase.
Feature folders: consistent lowercase names.
Zod schemas: descriptive names ending in Schema.
Schema files: <feature>.schema.ts or <form>.schema.ts.
Type files: .types.ts where a separate file is appropriate.
Constants: descriptive uppercase names for fixed values when consistent with the project.
9. Before and After Coding

Before coding:

Inspect existing folders, aliases, dependencies, and conventions.
Search for existing shared components and utilities.
Determine the correct feature boundary.
Plan the files and exports before implementation.

Before finishing:

Verify files are in the correct directories.
Verify shared fields integrate correctly with Formik.
Verify Zod validation and error mapping.
Verify feature imports use public entry points.
Check for circular dependencies.
Run available type checks, linting, and relevant tests.
Report files changed, checks run, and any remaining limitations.

Never claim a test or command succeeded unless it was actually run.