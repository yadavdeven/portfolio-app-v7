# 🧠 Debugging & Fixing a Third-Party React Native Bug using patch-package

This document explains **step-by-step**:
- how a React Native warning was identified
- how the exact root cause was located
- why `grep -R "Animated.View"` was used
- how the issue was fixed safely using `patch-package`

This is a **real-world debugging workflow**, not trial-and-error.

---

## 🚨 The Original Warning

While running the app in development mode, the following warning appeared:

```txt
A props object containing a "key" prop is being spread into JSX:
<Animated(View) {...props} />
React keys must be passed directly to JSX.

🧩 Step 1: Read the Warning Carefully

The warning text itself gives three crucial clues:

<Animated(View) {...props} />


From this, we immediately know:

1️⃣ The issue involves an Animated View
2️⃣ Props are being spread ({...props})
3️⃣ A key prop is inside those spread props

React rules say:

❌ key must NOT be passed via spread

✅ key must be passed directly on JSX

So the bug must be in code that:

uses Animated.View

spreads props

includes a key

🧠 Step 2: Identify Who Owns the Code

The warning did not point to any of our components.

To test whether it was our code or a library:

the loading indicator (UIActivityIndicator) was temporarily removed

the warning disappeared immediately

✅ This proved:

The bug is inside react-native-indicators

Not inside our application code

🧠 Step 3: Ask the Right Question

Now the problem became:

“Where inside react-native-indicators is Animated.View used?”

Instead of guessing, we searched the library directly.

🔍 Step 4: Why This Command Was Used
grep -R "Animated.View" node_modules/react-native-indicators

What this command does

grep → searches text inside files

-R → recursive (searches all subfolders)

Meaning:

“Search every file in react-native-indicators
and show all lines containing Animated.View”

🧠 Why Search for Animated.View Specifically?

Because the warning explicitly said:

<Animated(View) {...props} />


React internally prints Animated(View) instead of Animated.View in warnings.

So:

Warning text = search pattern

No guessing

No trial & error

🎯 Step 5: Finding the Exact Bug

The grep output revealed this line:

<Animated.View style={[styles.layer, layerStyle]} {...{ key: index }}>


This line is illegal React JSX because:

{...{ key: index }}  // ❌ key passed via spread


This perfectly matched the warning.

🧠 Step 6: Why This Was the Root Cause

❌ React forbids spreading key

❌ Library code was doing exactly that

✅ Removing the indicator removed the warning

✅ Fixing this line fixed the warning

This is direct evidence, not coincidence.

🛠️ Step 7: Why patch-package Was Needed

Constraints:

❌ You should not edit node_modules manually

❌ Forking the library is heavy

❌ Waiting for upstream fix is slow

Solution:

Use patch-package to safely fix third-party code

🧩 What patch-package Does

Think of it as Git commits for node_modules.

It:

records changes made inside node_modules

stores them as .patch files

re-applies them automatically after installs

🚶‍♂️ Step-by-Step Fix Using patch-package
✅ Step 1: Create patches folder
project-root/
├── patches/


Must be outside src.

✅ Step 2: Install patch-package
npm install patch-package postinstall-postinstall --save-dev

✅ Step 3: Add postinstall script

In package.json:

"postinstall": "patch-package"


Ensures patches apply after every install.

✅ Step 4: Fix the library code

File:

node_modules/react-native-indicators/src/components/ui-activity-indicator/index.js


❌ Before:

<Animated.View {...{ key: index }}>


✅ After:

<Animated.View key={index}>

✅ Step 5: Generate patch file
npx patch-package react-native-indicators


Creates:

patches/
└── react-native-indicators+0.xx.x.patch


Patch content (simplified):

- <Animated.View {...{ key: index }}>
+ <Animated.View key={index}>

✅ Step 6: Verify

Restart Metro

Reload app

Warning disappears

App behavior unchanged

✅ Step 7: Commit the patch

Commit only:

patches/react-native-indicators+0.xx.x.patch


Never commit node_modules.

🔐 Why This Approach Is Safe
Concern	Answer
Behavior changed?	❌ No
Runtime risk?	❌ None
Upgrade safe?	✅ Yes
Reversible?	✅ Delete patch
Industry standard?	✅ Yes

Used widely by:

Meta

Shopify

Microsoft RN teams

🧠 General Debugging Formula Learned

When you see a React warning:

1️⃣ Read the exact JSX in the warning
2️⃣ Identify the component type
3️⃣ Identify who owns that code
4️⃣ grep for the JSX pattern
5️⃣ Fix the smallest possible line
6️⃣ Patch it safely