const {db} = require('@arangodb');

const collections = [
    'hooks_svn'
];

for (const colName of collections)
{
    if (!db._collection(colName)) {
        db._createDocumentCollection(colName);
    }
}
