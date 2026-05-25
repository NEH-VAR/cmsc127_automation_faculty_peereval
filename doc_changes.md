# Documented Changes

## Date: 2026-05-21

### Summary
Enabled mock mode for routes `/client-forms`, `/nominate`, `/client-assurance`, and `/evaluate` so they are viewable without a valid token when `VITE_USE_MOCK=true`.

---

### Files Modified

#### 1. `frontend/src/mocks/mockRouteMap.js`
- Added `/nominate` path mapping to `'client-nominate'` key
- Added `/evaluate` path mapping to `'client-forms'` key

#### 2. `frontend/src/mocks/mockData.js`
- Enriched `'client-forms'` dataset with:
  - `auth`: EVALUATION purpose, mock token, user_id, reference_id
  - `userDetails`: mock user with id and full_name
  - `evaluation`: mock evaluation with nested nomination.evaluatee.full_name

#### 3. `frontend/src/mocks/mockApi.js`
- Added `auth.setUser` no-op method
- Added `evaluations.getById` method returning mock evaluation data
- Added `answers.submit` method returning `{ success: true }`

#### 4. `frontend/src/components/EvaluateRoute.jsx`
- Changed import from `../lib/api` to `../lib/apiProvider` (mock-aware)
- Added `USE_MOCK` import from `../lib/config`
- Added mock token fallback: `searchParams.get('token') || (USE_MOCK ? 'mock-token' : null)`
- Updated token check to bypass error when `USE_MOCK` is true: `if (!token && !USE_MOCK)`

---

### Route Status (with `VITE_USE_MOCK=true`)

| Route | Status | Notes |
|-------|--------|-------|
| `/client-forms` | Working | Already used apiProvider; mock fallbacks for evaluationId/evaluateeName |
| `/nominate` | Working | Already used apiProvider; mock token fallback already present |
| `/client-assurance` | Working | Static page, no API calls or token checks |
| `/evaluate` | Fixed | Now uses apiProvider, mock token fallback, and full mock API support |

---

## Date: 2026-05-21 (Update)

### Summary
Added name confirmation modal to evaluation submission flow. When clicking "Submit Evaluation", a modal prompts the user to enter their full name. The submit button is greyed out until the entered name matches the logged-in user's full name.

### Files Modified

#### 1. `frontend/src/components/client/ModalNameConfirm.jsx` (NEW)
- New modal component for name confirmation
- Props: `isOpen`, `onClose`, `onConfirm`, `expectedName`
- Validates entered name against `expectedName` (case-insensitive, trimmed)
- Button disabled (greyed out) when name doesn't match or is empty
- Supports Enter key submission when valid
- Design matches `local/Modal.png` with added title bar and close button

#### 2. `frontend/src/mocks/mockApi.js`
- Added `auth.getUser()` method returning mock user details

#### 3. `frontend/src/components/ClientForms.jsx`
- Added import for `ModalNameConfirm`
- Added state: `showNameModal`, `evaluatorName`
- Added `useEffect` to fetch evaluator name from `api.auth.getUser()`
- Split `handleSubmit` into validation + modal trigger
- Added `performSubmission()` for actual API submission
- Added `handleNameConfirm()` and `handleNameCancel()` handlers
- Renders `ModalNameConfirm` at the bottom of the form
