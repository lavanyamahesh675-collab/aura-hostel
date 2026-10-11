/**
 * Standalone script to validate XML, DTD, and XSD policy schemas
 */
const SchemaValidationService = require('../services/schemaValidationService');

try {
  console.log('📜 Executing XML, DTD & XSD Schema Validation...');
  const result = SchemaValidationService.validateRulesSchema();
  console.log('\n==================================================');
  console.log(`STATUS: ${result.status}`);
  console.log(`VALID: ${result.valid}`);
  console.log('FILES CHECKED:', result.files);
  console.log('PARSED RULES:', result.parsedRules);
  if (result.errors.length > 0) {
    console.error('ERRORS:', result.errors);
  }
  console.log('==================================================\n');
} catch (error) {
  console.error('❌ Validation script failed:', error.message);
}
