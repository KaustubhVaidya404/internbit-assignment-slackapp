import { App, ExpressReceiver } from '@slack/bolt';
import ngrok  from 'ngrok';
import dotenv from 'dotenv';

dotenv.config();

const receiver: ExpressReceiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET || '', endpoints: '/slack/events' });

const slackapp: App = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver
});


slackapp.shortcut("tagnmessage", async ({ shortcut, ack, client }) => {
    try {
        await ack()
        await client.views.open({
            trigger_id: shortcut.trigger_id,
            view: {
                type: "modal",
                callback_id: "message_view",
                title: {
                    type: "plain_text",
                    text: "Send Message"
                },
                submit: {
                    type: "plain_text",
                    text: "Send"
                },
                blocks: [
                    {
                        type: "input",
                        block_id: "user_pick",
                        element: {
                            type: "users_select",
                            action_id: "selected_user",
                        },
                        label: {
                            type: "plain_text",
                            text: "Select a user"
                        }
                    },
                    {
                        type: "input",
                        block_id: "message_input",
                        element: {
                            type: "plain_text_input",
                            action_id: "message",
                        },
                        label: {
                            type: "plain_text",
                            text: "Message"
                        }
                    }
                ]
            }
        })
    } catch(error: any) {
        console.error(error)
    }
});


slackapp.view("message_view", async ({ ack, body, view, client }) => {
    await ack();
    const sender = body.user.id;
    const user: string | null | undefined = view.state.values.user_pick.selected_user.selected_user;
    const message = view.state.values.message_input.message.value;
    
    try {

        await client.chat.postMessage({
            channel: user || "",
            text: `<@${sender}>: ${message}`,
        })
    } catch (error) {
        console.error(error);
    }
})


async function start() {
    try{
        const port = process.env.PORT;
        await slackapp.start(port || 3000);
        console.log(`server is running on port ${port}!`);
        const url = await ngrok.connect({
            addr: port,
            authtoken: process.env.NGROK_AUTH_TOKEN,
        });
        console.log(`Slack Bolt app is running! URL: ${url}`)
    } catch (error: any) {
        console.error(error);
    }
}

start();