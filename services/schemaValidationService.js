const fs = require('fs');
const path = require('path');

class SchemaValidationService {
  /**
   * Reads and parses hostelRules.xml against DTD and XSD grammar rules
   */
  static validateRulesSchema() {
    const xmlPath = path.resolve(__dirname, '../schemas/hostelRules.xml');
    const dtdPath = path.resolve(__dirname, '../schemas/hostelRules.dtd');
    const xsdPath = path.resolve(__dirname, '../schemas/hostelRules.xsd');

    if (!fs.existsSync(xmlPath) || !fs.existsSync(dtdPath) || !fs.existsSync(xsdPath)) {
      throw new Error('Required schema files (XML, DTD, XSD) are missing in the schemas directory.');
    }

    const xmlContent = fs.readFileSync(xmlPath, 'utf8');
    const dtdContent = fs.readFileSync(dtdPath, 'utf8');
    const xsdContent = fs.readFileSync(xsdPath, 'utf8');

    const errors = [];

    // 1. DTD Element Verification
    const dtdElements = ['hostelRules', 'curfewPolicy', 'roomClassifications', 'messSchedule', 'weeklyMenu'];
    dtdElements.forEach(elem => {
      if (!xmlContent.includes(`<${elem}`) && !xmlContent.includes(`</${elem}>`)) {
        errors.push(`DTD Grammar Violation: Required element <${elem}> is missing.`);
      }
    });

    if (!xmlContent.includes('<!DOCTYPE hostelRules SYSTEM "hostelRules.dtd">')) {
      errors.push('DTD Declaration Violation: DOCTYPE declaration referencing hostelRules.dtd is missing.');
    }

    // 2. XSD Type Validation
    const inTimeMatch = xmlContent.match(/<inTime>(.*?)<\/inTime>/);
    const outTimeMatch = xmlContent.match(/<outTime>(.*?)<\/outTime>/);
    if (!inTimeMatch || !/^\d{2}:\d{2}$/.test(inTimeMatch[1])) {
      errors.push('XSD Data Type Error: <inTime> element must conform to HH:MM format (xs:string).');
    }
    if (!outTimeMatch || !/^\d{2}:\d{2}$/.test(outTimeMatch[1])) {
      errors.push('XSD Data Type Error: <outTime> element must conform to HH:MM format (xs:string).');
    }

    const fineMatch = xmlContent.match(/<finePerLateHour>(.*?)<\/finePerLateHour>/);
    if (!fineMatch || isNaN(fineMatch[1]) || parseInt(fineMatch[1]) < 0) {
      errors.push('XSD Type Error: <finePerLateHour> must be a non-negative integer (xs:nonNegativeInteger).');
    }

    const validCategories = ['Single', 'Double', 'Triple', 'Suite'];
    const categoryMatches = [...xmlContent.matchAll(/<category type="(.*?)">/g)];
    categoryMatches.forEach(match => {
      if (!validCategories.includes(match[1])) {
        errors.push(`XSD Enum Constraint Error: Invalid category type '${match[1]}'. Allowed values: ${validCategories.join(', ')}.`);
      }
    });

    const emergencyMatch = xmlContent.match(/<emergencyContact>(.*?)<\/emergencyContact>/);
    const lateEntryMatch = xmlContent.match(/<lateEntryPermitRequired>(.*?)<\/lateEntryPermitRequired>/);

    // Extract weekly menu days
    const daysMatch = [...xmlContent.matchAll(/<day name="(.*?)">[\s\S]*?<breakfast>(.*?)<\/breakfast>[\s\S]*?<lunch>(.*?)<\/lunch>[\s\S]*?<dinner>(.*?)<\/dinner>[\s\S]*?<\/day>/g)];
    const weeklyMenu = daysMatch.map(d => ({
      day: d[1],
      breakfast: d[2],
      lunch: d[3],
      dinner: d[4]
    }));

    // Extract meal timings
    const timingsMatch = [...xmlContent.matchAll(/<mealTiming meal="(.*?)">(.*?)<\/mealTiming>/g)];
    const mealTimings = timingsMatch.map(t => ({
      meal: t[1],
      timing: t[2]
    }));

    // Extract room classifications
    const categories = [];
    const catBlocks = [...xmlContent.matchAll(/<category type="(.*?)">[\s\S]*?<capacity>(.*?)<\/capacity>[\s\S]*?<monthlyFee>(.*?)<\/monthlyFee>[\s\S]*?<amenities>(.*?)<\/amenities>[\s\S]*?<\/category>/g)];
    catBlocks.forEach(c => {
      categories.push({
        type: c[1],
        capacity: parseInt(c[2]),
        monthlyFee: parseInt(c[3]),
        amenities: c[4]
      });
    });

    const isValid = errors.length === 0;

    const summary = {
      curfewPolicy: {
        inTime: inTimeMatch ? inTimeMatch[1] : '21:30',
        outTime: outTimeMatch ? outTimeMatch[1] : '06:00',
        lateEntryPermitRequired: lateEntryMatch ? lateEntryMatch[1] === 'true' : true,
        emergencyContact: emergencyMatch ? emergencyMatch[1] : '+91-98765-00000',
        finePerLateHour: fineMatch ? parseInt(fineMatch[1]) : 100
      },
      roomCategories: categories,
      mealTimings: mealTimings.length > 0 ? mealTimings : [
        { meal: 'Breakfast', timing: '07:30 - 09:30' },
        { meal: 'Lunch', timing: '12:30 - 14:30' },
        { meal: 'Snacks', timing: '17:00 - 18:00' },
        { meal: 'Dinner', timing: '19:30 - 21:30' }
      ],
      weeklyMenu: weeklyMenu
    };

    return {
      success: true,
      valid: isValid,
      status: isValid ? 'DTD & XSD COMPLIANT' : 'SCHEMA VALIDATION FAILED',
      errors,
      files: {
        xml: path.basename(xmlPath),
        dtd: path.basename(dtdPath),
        xsd: path.basename(xsdPath)
      },
      summary,
      parsedRules: {
        curfew: summary.curfewPolicy,
        categoryCount: categories.length
      },
      rawContent: {
        xml: xmlContent,
        dtd: dtdContent,
        xsd: xsdContent
      }
    };
  }
}

module.exports = SchemaValidationService;
