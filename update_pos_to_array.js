// MongoDB shell script to migrate partOfSpeech to partsOfSpeech array
var bulkOps = [];
var batchSize = 1000;
var count = 0;

db.words.find({
    $or: [
        { partOfSpeech: { $exists: true } },
        { partsOfSpeech: { $exists: false } }
    ]
}).forEach(function(doc) {
    var newPartsOfSpeech = [];
    
    // Standardize part of speech values
    const posMap = {
        'NOUN': 'NOUN',
        'VERB': 'VERB',
        'ADJECTIVE': 'ADJECTIVE',
        'ADVERB': 'ADVERB',
        'PHRASE': 'PHRASE',
        'PRONOUN': 'PRONOUN',
        'PREPOSITION': 'PREPOSITION',
        'CONJUNCTION': 'CONJUNCTION',
        'INTERJECTION': 'INTERJECTION',
        'adjective': 'ADJECTIVE',
        'adverb': 'ADVERB',
        'pronoun': 'PRONOUN',
        'preposition': 'PREPOSITION',
        'conjunction': 'CONJUNCTION',
        'interjection': 'INTERJECTION',
        'ADVERB': 'ADVERB' // Explicit mapping for uppercase ADVERB
    };

    // Handle existing partOfSpeech value
    if (doc.partOfSpeech && typeof doc.partOfSpeech === 'string') {
        const posValue = doc.partOfSpeech.trim().toUpperCase();
        
        // Handle compound POS (e.g. "adjective/adverb")
        if (posValue.includes('/')) {
            newPartsOfSpeech = posValue.split('/')
                .map(part => part.trim())
                .map(part => posMap[part] || part)
                .filter(Boolean);
        } 
        // Handle simple POS
        else {
            newPartsOfSpeech = [posMap[posValue] || posValue];
        }
    }
    // Handle if already has partsOfSpeech but not in array format
    else if (doc.partsOfSpeech && !Array.isArray(doc.partsOfSpeech)) {
        newPartsOfSpeech = [doc.partsOfSpeech.toString().toUpperCase()];
    }
    // Default to ["NOUN"] if no partOfSpeech exists (NOUN is most common)
    else if (!doc.partOfSpeech && !doc.partsOfSpeech) {
        newPartsOfSpeech = ["NOUN"];
    }
    // Keep existing if already in correct format
    else if (Array.isArray(doc.partsOfSpeech)) {
        return; // Skip already formatted docs
    }

    bulkOps.push({
        updateOne: {
            filter: { _id: doc._id },
            update: {
                $set: { partsOfSpeech: newPartsOfSpeech },
                $unset: { partOfSpeech: "" },
                $setOnInsert: { createdAt: new Date() }
            },
            upsert: false
        }
    });

    count++;
    
    // Execute in batches
    if (bulkOps.length === batchSize) {
        db.words.bulkWrite(bulkOps);
        bulkOps = [];
        print(`Processed ${count} documents...`);
    }
});

// Process remaining operations
if (bulkOps.length > 0) {
    db.words.bulkWrite(bulkOps);
    print(`Processed ${count} documents in total.`);
}

print("Migration completed successfully!");