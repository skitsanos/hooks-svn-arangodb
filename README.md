# hooks-svn-arangodb
ArangoDB Foxx Service and node.js bot to sync SVN revision logs into ArangoDB

This instrumentary has the following tools

- CLI utility written as Node.js made bot that you can execute on time intervals or as a post commit hook for Visual SVN Server or whatver else you might be using.

- Foxx service that runs inside ArangoDB

---

>### ArangoDB Foxx
>https://www.arangodb.com/why-arangodb/foxx/
>Foxx is a JavaScript framework for writing data-centric HTTP microservices that run directly inside of ArangoDB.

---

## Running whole thing

### Preparing ArangoDB

Once you downloaded _hooks_svn_arangodb_ you will need just few more steps

- Make sure tht your ArangoDB is up and runnign and accessible from the machine where you install your service
- Run _foxx install_ on _foxx-service_ folder that comes from this repo

Once service is installed to the endpoint you specified, you can test it by going on  _http://your_arangodb_server/.../your_endpoint/hooks-svn/_ and it should bring you response like the following:

```json
{
    "result": "ok"
}
```

Here we go, you've got running.

You might want to put your Foxx service behind some proxy with different authentication rules and so on, like in some of my cases, I put my foxx services behind /api virtual folder on my web apps or even giving _api_ subdoman to them.

### Setting up the bot

Now we need to setup the bot itself, which is pretty straight forward CLI writtend in Node.js that using unirest, commander and node-svn-ultimate modules.

- Inside of . _svn-bot_ folder run

```sh
yarn
```

Once dependencies are installed you can run _yarn start_

```sh
yarn start --help
```

### CLI options

```
  -a, --address [svn address]      address                                                                                                                                                    
  -u, --username [username]        username                                                                                                                                                   
  -p, --password [password]        password                                                                                                                                                   
  -d, --destination [destination]  API destination where data will be sent                                                                                                                    
  -h, --help                       output usage information      
```

While _-a, -u, -p_ are all about connecting to your SVN server, _-d_ is the address where your SVN web hook is located
