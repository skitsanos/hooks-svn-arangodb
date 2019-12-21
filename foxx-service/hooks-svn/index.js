const createRouter = require('@arangodb/foxx/router');
const {db, query, time} = require('@arangodb');
const joi = require('joi');

const r = createRouter();
module.exports = r;

const collection = db._collection('hooks_svn');

r.get('/hooks-svn', (req, res) =>
{
    res.send({
        result: 'ok'
    });
});

r.get('/hooks-svn/log/last', (req, res) =>
{
    const start = time();

    if (req.queryParams && Object.prototype.hasOwnProperty.call(req.queryParams, 'repo'))
    {
        const queryResult = query`
        FOR doc in hooks_svn
        FILTER doc.repo==${req.queryParams.repo}
        sort doc.log.revision desc
        limit 1
        RETURN unset(doc, "_id","_rev")
        `.toArray();

        res.send({
            result: queryResult.length > 0 ? queryResult[0] : null,
            execTime: time() - start
        });
    }
    else
    {
        res.throw(417, 'missing repo query');
    }
})
    .response(['application/json'], 'SVN Revisions - Get last stored')
    .description('Gets a last stored SVN revision');

r.get('/hooks-svn/log/:id', (req, res) =>
{
    const start = time();

    const queryResult = query`
    FOR doc in hooks_svn
    FILTER doc._key==${req.pathParams.id}
    RETURN unset(doc, "_id","_rev")
    `.toArray();

    res.send({
        result: queryResult.length > 0 ? queryResult[0] : null,
        execTime: time() - start
    });
})
    .pathParam('id', joi.string().required(), 'Log id')
    .response(['application/json'], 'SVN Revisions - Get by Id')
    .description('Gets a SVN revision by its id');

r.post('/hooks-svn', (req, res) =>
{
    const doc = req.body;

    /*    Object.assign(doc, {
            createdOn: new Date().getTime()
        });*/

//check if revision is already stored
    const queryResult = query`
    FOR doc in hooks_svn
    FILTER doc.log.revision==${doc.log.revision}
    RETURN clients
    `.toArray();

    if (queryResult.length > 0)
    {
        res.throw(409, 'Already exists');
    }

    const meta = collection.save(doc);
    res.send({result: meta});
})
    .body(joi.object({
        repo: joi.string(),
        log: joi.object({
            revision: joi.number(),
            author: joi.string(),
            date: joi.number(),
            message: joi.string()
        })
    }))
    .response(['application/json'], 'SVN Hooks - Add record')
    .description('Adds new svn hook record');
