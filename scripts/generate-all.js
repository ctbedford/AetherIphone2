const { execSync } = require('child_process');
const path = require('path');

/**
 * This script runs all code generation scripts in the correct order.
 * It ensures that:
 * 1. TRPC types are generated first (shared zod schemas)
 * 2. React Query hooks are generated from the TRPC router
 */
console.log('🚀 Running all code generators...');

try {
  console.log('\n📝 Generating TRPC shared types...');
  execSync('node ./scripts/generate-trpc-types.js', { stdio: 'inherit' });
  
  console.log('\n📝 Generating TRPC client hooks...');
  execSync('node ./scripts/generate-trpc-client.js', { stdio: 'inherit' });

  console.log('\n✅ All code generation complete!');
  console.log('\n🔍 Checking for TypeScript errors...');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('✅ TypeScript validation successful!');
  } catch (error) {
    console.log('⚠️ TypeScript validation found some errors. Please fix them before continuing.');
  }

} catch (error) {
  console.error('\n❌ Generation failed:', error.message);
  process.exit(1);
} 