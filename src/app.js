

const { App } = require('@slack/bolt');
const ngrok = require('ngrok');
const dotenv = require('dotenv');

dotenv.config();


// creating app and adding secret keys
const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
});


app.shortcut("tagnmessage", async ({ shortcut, ack, client }) => {
    try {
        await ack();


        const result = await client.views.open({
            trigger_id: shortcut.trigger_id,
            view: {
                type: "modal",
                callback_id: "message_view",
                title: {
                    type: "plain_text",
                    text: "Send Message"
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
    } catch (error) {
        console.error(error);
    }
})


app.view("message_view", async ({ ack, body, view, client }) => {
    await ack();
    const user = view.state.values.user_pick.selected_user.selected_user;
    const message = view.state.values.message_input.message.value;

    try {
        await client.chat.postMessage({
            channel: user,
            text: message
        })
    } catch (error) {
        console.error(error);
    }
})




// starting the app and server on ngrok

async function startApp() {
    try {
        const port = process.env.PORT;
        await app.start(port);
        console.log(`server is running on port ${port}!`);
        const url = await ngrok.connect({
            addr: 8080,
            authtoken: process.env.NGROK_AUTH_TOKEN,
            subdomain: "/tagnmessage"
        });
        console.log(`Slack Bolt app is running! URL: ${url}`);
    } catch (error) {
        console.error(error);
    }
}

startApp();