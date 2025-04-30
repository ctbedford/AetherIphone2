const fs = require('fs').promises;
const path = require('path');

// Assuming the script runs from the project root.
const projectRoot = process.cwd();
const outputFilePath = path.join(projectRoot, 'o3.txt');

// Files relevant to the runtime errors
const filesToRead = [
    // PrinciplesTab error - "principles.map is not a function"
    { path: 'app/(tabs)/compass/index.tsx', issue: 'Main compass screen that renders PrinciplesTab' },
    { path: 'components/compass/PrinciplesTab.tsx', issue: 'TypeError: principles.map is not a function (it is undefined)' },
    
    // Rewards duplicate key errors
    { path: 'app/(tabs)/rewards/index.tsx', issue: 'Duplicate Key Warning: "Encountered two children with the same key, `.$undefined-grid=2undefined-grid`"' },
    
    // Missing routes errors
    { path: 'app/(tabs)/_layout.tsx', issue: 'Warnings: "No route named planner/index & settings/index exists in nested children"' },
    { path: 'app/(tabs)/planner/index.tsx', issue: 'Possibly missing or index file needs to be created' },
    { path: 'app/(tabs)/settings/index.tsx', issue: 'Possibly missing or index file needs to be created' },
    
    // Missing ScrollView error
    { path: 'app/(tabs)/planner/index.tsx', issue: 'ReferenceError: Property "ScrollView" doesn\'t exist' },
    
    // Related navigation files
    { path: 'app/(tabs)/planner/_layout.tsx', issue: 'Navigation structure for planner tab' },
    { path: 'app/(tabs)/settings/_layout.tsx', issue: 'Navigation structure for settings tab' },
];

// Detailed analysis of the runtime errors we're investigating
const errorAnalysis = `
Okay, let's go through the "Debug Report" you provided, linking the issues to the specific code snippets and identifying any other files needed.

**1. Issue: \`TypeError: principles.map is not a function\` (Context: \`PrinciplesTab.tsx\`)**

* **File Context:** The report mentions \`components/compass/PrinciplesTab.tsx\` but states the file was not found. The error itself (\`principles.map is not a function\`) strongly suggests that inside the *actual* \`PrinciplesTab.tsx\` component (wherever it resides), the \`principles\` variable fetched by \`trpc.value.getValues.useQuery()\` is \`undefined\` when the code tries to call \`.map()\` on it.
* **Explanation:** This is the same pattern as the error we fixed in \`HomeScreen\`. The component needs to check \`isLoading\`, \`error\`, and whether \`principles\` is actually an array before attempting to map over it.
* **Files Needed for Deeper Dive:**
    * \`components/compass/PrinciplesTab.tsx\` (The actual file content is needed to confirm the fix).
    * \`server/src/routers/valueRouter.ts\` (To verify the exact structure returned by \`getValues\`).

**2. Issue: Duplicate Key Warning in \`RewardsScreen\`**

* **File Context:** \`app/(tabs)/rewards/index.tsx\`
* **Explanation:** The warning \`Encountered two children with the same key, '.$undefined-grid=2undefined-grid'\` points to an issue within the \`FlatList\`. Your \`keyExtractor\` function uses a pattern like (item) => 'item.id-viewMode'. The generated key \`.$undefined-grid=2undefined-grid\` strongly implies that for at least one item being rendered when viewMode is 'grid', item.id is undefined. When you switch viewMode, FlatList might be trying to reuse internal state based on keys, and if item.id is undefined, it leads to this conflict.
* **Check:** Ensure that *every* reward object in the \`rewards\` array returned by \`trpc.rewards.getAvailableRewards.useQuery()\` has a valid, unique \`id\` property *before* it gets to the \`FlatList\`. Check the data fetching logic and the backend router.
* **Files Needed for Deeper Dive:**
    * \`server/src/routers/rewardsRouter.ts\` (To check the data returned by \`getAvailableRewards\` and ensure all items have IDs).

**3. Issue: Routing Warnings in \`app/(tabs)/_layout.tsx\` Context**

* **File Context:** \`app/(tabs)/_layout.tsx\`
* **Explanation:** The code snippet you provided for \`app/(tabs)/_layout.tsx\` *correctly* uses the full path names like \`name="home/index"\`, \`name="planner/index"\`, etc. This *should* fix the "No route named..." warnings seen in the previous logs.
* **Possible Reasons for Persisting Warnings (if they still occur):**
    * The running app might not have fully reflected the code change yet (clear cache, restart Metro).
    * There might be *other* places in the code (like \`Link\` components or \`router.push\` calls) that are still using the old, incorrect short names (e.g., \`href="/home"\` instead of \`href="/home/index"\`). The previous logs showed warnings for \`home\`, \`compass\`, and \`rewards\`, while the report context only mentions \`planner\` and \`settings\`. Verify if the warnings changed.
    * An issue deeper within Expo Router's handling of nested layouts.
* **Action:** Confirm if the warnings *specifically* for \`planner/index\` and \`settings/index\` are still showing up *after* applying the fix in \`_layout.tsx\`. If so, investigate \`Link\` or \`router.push\` calls related to those tabs.

**4. Issue: \`ReferenceError: Property "ScrollView" doesn't exist\` (Context: \`app/(tabs)/planner/index.tsx\`)**

* **File Context:** \`app/(tabs)/planner/index.tsx\`
* **Explanation:** The code uses \`<ScrollView>\` components to wrap \`GoalsTab\`, \`HabitsTab\`, and \`CalendarTab\`. However, \`ScrollView\` is not imported at the top of the file.
* **✅ Fix:** Add the import, likely from \`tamagui\` since you're using other Tamagui components:
    \`\`\`javascript
    // At the top of app/(tabs)/planner/index.tsx
    import { YStack, XStack, Text, Tabs, Button, Spinner, Card, ScrollView } from 'tamagui'; // Add ScrollView here
    // or if you intended the React Native one:
    // import { ScrollView } from 'react-native'; 
    \`\`\`

**Summary of Files Needed for Further Investigation:**

1.  \`components/compass/PrinciplesTab.tsx\` (Content is missing from the report)
2.  \`server/src/routers/rewardsRouter.ts\` (To check data structure from \`getAvailableRewards\`)

Addressing the missing import in \`PlannerScreen\` and checking the data for \`RewardsScreen\` should resolve those specific errors. For the \`PrinciplesTab\` error, we need the actual file content to apply the fix.
`;

async function gatherDebugInfo() {
    let outputContent = `Debug Report - ${new Date().toISOString()}\n`;
    outputContent += `Generated by gather_debug_info.js\n`;
    outputContent += `Focusing on files related to the runtime errors.\n\n`;

    for (const fileInfo of filesToRead) {
        const absolutePath = path.resolve(projectRoot, fileInfo.path);
        outputContent += `========================================\n`;
        outputContent += `FILE: ${fileInfo.path}\n`;
        outputContent += `ISSUE CONTEXT: ${fileInfo.issue}\n`;
        outputContent += `----------------------------------------\n\n`; // Added newline for spacing
        try {
            // Check if file exists before reading
            await fs.access(absolutePath, fs.constants.F_OK);
            const content = await fs.readFile(absolutePath, 'utf-8');
            outputContent += content;
        } catch (error) {
             if (error.code === 'ENOENT') {
                outputContent += `Error: File not found at ${absolutePath}\n`;
                outputContent += `This missing file could be related to the routing or component errors.\n`;
                console.warn(`Warning: File not found at ${absolutePath}`);
             } else {
                outputContent += `Error reading file: ${error.message}\n`;
                console.error(`Error reading ${absolutePath}:`, error);
             }
        }
        outputContent += `\n\n[EOF: ${fileInfo.path}]\n\n`; // Add End Of File marker
    }
    
    // Append our detailed analysis to the end of the report
    outputContent += `\n========================================\n`;
    outputContent += `ERROR ANALYSIS AND RECOMMENDATIONS\n`;
    outputContent += `----------------------------------------\n\n`;
    outputContent += errorAnalysis;

    try {
        await fs.writeFile(outputFilePath, outputContent);
        console.log(`Successfully wrote debug information for runtime errors to ${outputFilePath}`);
    } catch (error) {
        console.error(`Error writing to ${outputFilePath}:`, error);
        process.exit(1);
    }
}

gatherDebugInfo();