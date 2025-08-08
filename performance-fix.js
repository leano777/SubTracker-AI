// Performance Fix for Freezing Issues
// Run this in browser console to temporarily fix performance problems

console.log("🚀 Applying Performance Fixes...");

// 1. Disable excessive debug logging
if (window.console) {
    const originalLog = console.log;
    console.log = function(...args) {
        // Only log errors and important messages, skip debug spam
        if (args.length > 0 && typeof args[0] === 'string') {
            const message = args[0];
            if (message.includes('[') && (
                message.includes('recalculated') ||
                message.includes('stableUserId') ||
                message.includes('themeValues') ||
                message.includes('computedValues')
            )) {
                // Skip excessive debug logs that can cause freezing
                return;
            }
        }
        originalLog.apply(console, args);
    };
    console.log("✅ Reduced debug logging");
}

// 2. Force garbage collection if available
if (window.gc) {
    window.gc();
    console.log("✅ Forced garbage collection");
}

// 3. Clear any stuck timers
let highestTimeoutId = setTimeout(() => {});
for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
}
console.log("✅ Cleared potential stuck timers");

// 4. Reset any stuck intervals
let highestIntervalId = setInterval(() => {}, 10000);
clearInterval(highestIntervalId);
for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i);
}
console.log("✅ Cleared potential stuck intervals");

// 5. Optimize React rendering (if available)
if (window.React && window.React.unstable_batchedUpdates) {
    console.log("✅ React batching available");
}

// 6. Clear any cached data that might be causing loops
try {
    // Clear specific cache keys that might be problematic
    const keysToCheck = ['subtracker_cache_', 'dataSync_'];
    let clearedKeys = 0;
    
    for (let key in localStorage) {
        if (keysToCheck.some(prefix => key.startsWith(prefix))) {
            localStorage.removeItem(key);
            clearedKeys++;
        }
    }
    
    if (clearedKeys > 0) {
        console.log(`✅ Cleared ${clearedKeys} potentially problematic cache keys`);
    }
} catch (error) {
    console.log("⚠️ Could not clear cache:", error.message);
}

// 7. Monitor performance
const startTime = performance.now();
setTimeout(() => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    console.log(`✅ Performance check: ${responseTime.toFixed(2)}ms response time`);
    
    if (responseTime > 100) {
        console.log("⚠️ Slow response detected - may indicate performance issues");
    }
}, 50);

console.log("🎯 Performance fixes applied! Try using the app now.");
console.log("If still frozen, try: location.reload() to refresh the page");
