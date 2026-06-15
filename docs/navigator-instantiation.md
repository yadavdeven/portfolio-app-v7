# Navigator Instantiation — Why It Belongs at Module Scope

A short reference on a navigation fix applied to `RootNavigator`, `AppNavigator`,
and `AuthNavigator`: moving `createNativeStackNavigator()` out of the component
body and up to **module scope**, why the original code was a problem, and what
the fix guarantees.

---

## 1. The issue in one paragraph

Each navigator used to call `createNativeStackNavigator()` **inside** its
component function. That call builds a brand-new navigator object (with its own
`Navigator` and `Screen` components) on **every render**. Because React
identifies components by reference, a fresh `Stack` each render is seen as a
*different* component type than the one from the previous render — so React
cannot reconcile them. Instead of updating the existing tree, it unmounts the
old navigator and mounts a new one. The fix is to create the navigator **once**,
at module load, so the same `Stack` reference is reused across all renders.

---

## 2. Before / after

### Before — created on every render

```tsx
export default function AppNavigator() {
  const Stack = createNativeStackNavigator<AppStackParamList>(); // new object each render

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* screens */}
    </Stack.Navigator>
  );
}
```

### After — created once at module scope

```tsx
const Stack = createNativeStackNavigator<AppStackParamList>(); // created once

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* screens */}
    </Stack.Navigator>
  );
}
```

---

## 3. Why the old code was a real problem

| Symptom | Cause |
|---------|-------|
| **Navigation state can reset** | A new `Stack` is a new component type; React remounts the navigator instead of updating it, which can discard the in-memory navigation state (current route, history stack). |
| **Screens remount unexpectedly** | When the parent navigator remounts, its screens unmount and re-run their mount effects (`useEffect`, data fetches, animations restart). |
| **Wasted work / GC churn** | A full navigator object graph is allocated and thrown away on every render of the parent component. |
| **Subtle, hard-to-trace bugs** | These effects only surface when the navigator component re-renders (e.g. a parent state/context change), so they look intermittent. |

`createNativeStackNavigator()` is a **factory** — it is meant to be invoked one
time to produce the `Navigator`/`Screen` pair, exactly like you'd define a
component once rather than redefining it on each render. It does not depend on
props or state, so there is no reason for it to live inside the render body.

---

## 4. What the fix guarantees

- **Stable component identity** — the same `Stack.Navigator` / `Stack.Screen`
  references persist across renders, so React reconciles (updates) the existing
  tree instead of remounting it.
- **Preserved navigation state** — route history and the current screen survive
  parent re-renders.
- **No redundant allocations** — the navigator object is built a single time per
  module load.

This mirrors the official React Navigation guidance: call
`createXNavigator()` once, outside the component.

---

## 5. Files changed

| File | Change |
|------|--------|
| [`src/navigation/RootNavigator.tsx`](../src/navigation/RootNavigator.tsx) | `createNativeStackNavigator<RootStackParamList>()` moved to module scope |
| [`src/navigation/AppNavigator.tsx`](../src/navigation/AppNavigator.tsx)  | `createNativeStackNavigator<AppStackParamList>()` moved to module scope |
| [`src/navigation/AuthNavigator.tsx`](../src/navigation/AuthNavigator.tsx) | `createNativeStackNavigator<AuthStackParamList>()` moved to module scope |
