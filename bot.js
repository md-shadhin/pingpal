const { ActivityHandler, MessageFactory, ActivityTypes } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor(conversationReferences) {
        super();

        this.conversationReferences = conversationReferences;

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

            if (context.activity.conversation.id === process.env.DEV_ID) {
                let msg = context.activity.text;
                if(this.startsWithAll(msg)){
                    msg = this.removeAtAll(msg);

                    for (const conversationReference of Object.values(this.conversationReferences)) {
                        await context.adapter.continueConversationAsync(process.env.MicrosoftAppId, conversationReference, async context => {
                            await context.sendActivity(MessageFactory.text(msg, msg));
                        });
                    }
                }
                else{
                    await context.sendActivity(MessageFactory.text(msg, msg));
                }
            }
            else {
                await context.sendActivities([
                    { type: ActivityTypes.Typing },
                    { type: 'delay', value: 1000 }
                ]);
                const replyText = `You said: ${context.activity.text}. Why?`;
                await context.sendActivity(MessageFactory.text(replyText, replyText));
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = "Welcome to PingPal!\n\nIt keeps the Mobile Apps Team on track with quick reminders and updates!\n\nCurrently, PingPal is designed only to notify about the standup sheet and doesn't respond to messages. Future updates will introduce new features, including the ability to respond to your replies.\n\nStay tuned for more!";
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    removeAtAll(sentence) {
        return sentence.replace(/^@all\s+/, '');
    }

    startsWithAll(sentence) {
        return sentence.startsWith('@all');
    }

}

module.exports.EchoBot = EchoBot;
