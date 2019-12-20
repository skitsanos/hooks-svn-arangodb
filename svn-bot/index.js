#!/usr/bin/env node

const unirest = require('unirest');
const svn = require('node-svn-ultimate');
const program = require('commander');
const pkg = require('./package');
program.version(pkg.version);

program
    .option('-v, --verbose', 'output extra information at runtime')
    .requiredOption('-a, --address [svn address]', 'address')
    .requiredOption('-u, --username [username]', 'username')
    .requiredOption('-p, --password [password]', 'password')
    .requiredOption('-d, --destination [destination]', 'API destination where data will be sent');

program.parse(process.argv);

console.log(`Probing GET ${program.destination} ...`);

const uploadToApi = doc =>
{
    unirest.post(program.destination)
        .headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        .send(doc)
        .end(res =>
        {
            console.log(`${res.status} -- #${doc.log.revision} ${doc.log.message}`);
        });

};

unirest.get(program.destination)
    .end(res =>
    {
        if (res.status === 200)
        {
            console.log('Got API working');

            //check last revision number uploaded for this repo
            unirest.get(`${program.destination}/log/last?repo=${program.address}`)
                .end(res_last =>
                {
                    if (res_last.status === 200)
                    {
                        const {result} = res_last.body;

                        const {revision} = result.log;
                        svn.commands.log(program.address, {
                            trustServerCert: true,
                            revision: result ? `HEAD:${revision}` : `HEAD:1`,
                            username: program.username,
                            password: program.password
                        }, (err, data) =>
                        {
                            if (!err)
                            {
                                if (!Array.isArray(data.logentry))
                                {
                                    const doc = {
                                        repo: program.address,
                                        log: {
                                            revision: Number(data.logentry.$.revision),
                                            author: data.logentry.author,
                                            date: new Date(data.logentry.date).getTime(),
                                            message: data.logentry.msg
                                        }
                                    };

                                    if (doc.log.revision > revision)
                                    {
                                        uploadToApi(doc);
                                    }
                                }
                                else
                                {
                                    for (const entry of data.logentry)
                                    {
                                        const doc = {
                                            repo: program.address,
                                            log: {
                                                revision: Number(entry.$.revision), author: entry.author,
                                                date: new Date(entry.date).getTime(),
                                                message: entry.msg
                                            }
                                        };

                                        if (doc.log.revision > revision)
                                        {
                                            uploadToApi(doc);
                                        }
                                    }
                                }
                            }
                        });
                    }
                    else
                    {
                        process.exit(127);
                    }
                });
        }
        else
        {
            console.log('\33[41m' + `ERROR: ${res.body.errorMessage}` + '\33[0m');
            process.exit(127);
        }
    });
