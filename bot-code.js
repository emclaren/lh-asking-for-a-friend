var restify = require('restify');
var builder = require('botbuilder');

var category;

var resourceData = {
    "in person": {
        resource: "https://apps.kidshelpphone.ca/resourcesaroundme/welcome.html"
    },
    "phone": {
        resource: "1-800-273-8255"
    }
};

var userData ={
	"Feeling Anxious": {
		diag: "Anxiety",
		online: "https://www.anxietybc.com/"
	},
	"Feeling Sad": {
		diag: "Depression",
		online: "http://depressionhurts.ca/en/about/"
	},
	"Can't Eat": {
		diag: "Eating Disorder",
		online: "https://www.nationaleatingdisorders.org/learn/general-information"
	},
	"Can't Sleep": {
		diag: "Sleeping Disorder",
		online: "https://sleepfoundation.org/sleep-disorders-problems"
	}
}

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: '279354db-c4c1-4c00-905d-4d8432ae3fac',
    appPassword: 'hqD0UVQZxxg1xAVg7dAzmya'
});
var bot = new builder.UniversalBot(connector);

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, [
	
    function (session) {
		session.send("Hello friend");
		session.sendTyping();
		setTimeout(function () {
			session.beginDialog('askForHelp');
		}, 4000);
	},
    function (session, results) {
        session.dialogData.category = results.response;
		category = userData[results.response.entity];
        session.beginDialog('Definition');
    },
    function (session, results) {
        session.dialogData.concern = results.response.entity;
		if(results.response){
			if(results.response.entity == "learn more"){
                session.beginDialog("learn");
            }
            else if(results.response.entity == "get help"){
                session.beginDialog("resources");
            }
		}	
	},
	function (session, results) {
		session.send("Have a good day, I hope this was useful to you today!");
        session.endDialog();
    }
	

]);

// Dialog to ask for category
bot.dialog('askForHelp', [
    function (session) {
        builder.Prompts.choice(session, "What would you like to talk about today?", "Feeling Anxious|Feeling Sad|Can't Sleep|Can't Eat", { listStyle: 3 } );
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('Definition', [
    function (session) {
		session.send("Do not worry- you are NOT alone. I am here to help you.")
		session.sendTyping();
		setTimeout(function () {
			builder.Prompts.choice(session, "It sounds like you might be dealing with" + ` ${category.diag} ` + ". Did you want to ", "learn more|get help", { listStyle: 3 });
		}, 4000);
    },
	function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('learn', [
    function (session) {
        session.send("The definition of "+ ` ${category.diag} ` + " can be found: ");
		session.send(` ${category.online} `);
		session.sendTyping();
		setTimeout(function () {
			builder.Prompts.choice(session, "Did you have any other information today?","yes|no",{ listStyle: 3 });
		}, 10000);
    },
	function (session, results) {
        if (results.response) {
			if(results.response.entity == "yes"){
				session.beginDialog("resources");
			}
			else{
				session.endDialogWithResult(results);
			}
		}
    }
]);

bot.dialog('resources', [
    function (session) {
        builder.Prompts.choice(session, "Are you looking for help?", "in person|online|phone", { listStyle: 3 });
    },
	function (session, results) {
        if (results.response) {
			if(results.response.entity == "online"){
                session.beginDialog("learn");
			}
			else{
				var type = resourceData[results.response.entity];
				session.send("You can find the help you need on:")
				session.send(` ${type.resource} `);
			}
		}
		else{
			session.endDialogWithResult(results);
		}
    }
]);





// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
//var bot = new builder.UniversalBot(connector, function (session) {
//    session.send("You said: %s", session.message.text);
//});