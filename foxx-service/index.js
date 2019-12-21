/**
 * Foxx Services Template
 * @author Skitsanos, https://linkedin.com/in/skitsanos
 */
const {query} = require('@arangodb');

module.context.use('/', require('./services/hooks-svn/index'));

module.context.checkAuth = headers =>
{
    return true;
};

module.context.use((req, res, next) =>
{
    if (!module.context.checkAuth(req.headers))
    {
        res.throw('unauthorized');
    }

    next();
});
