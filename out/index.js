"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bolt_1 = require("@slack/bolt");
const ngrok_1 = __importDefault(require("ngrok"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const receiver = new bolt_1.ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET || '', endpoints: '/slack/events' });
const slackapp = new bolt_1.App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver
});
slackapp.shortcut("tagnmessage", (_a) => __awaiter(void 0, [_a], void 0, function* ({ shortcut, ack, client }) {
    try {
        yield ack();
        yield client.views.open({
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
        });
    }
    catch (error) {
        console.error(error);
    }
}));
slackapp.view("message_view", (_a) => __awaiter(void 0, [_a], void 0, function* ({ ack, body, view, client }) {
    yield ack();
    const sender = body.user.id;
    const user = view.state.values.user_pick.selected_user.selected_user;
    const message = view.state.values.message_input.message.value;
    try {
        yield client.chat.postMessage({
            channel: user || "",
            text: `<@${sender}>: ${message}`,
        });
    }
    catch (error) {
        console.error(error);
    }
}));
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const port = process.env.PORT;
            yield slackapp.start(port || 3000);
            console.log(`server is running on port ${port}!`);
            const url = yield ngrok_1.default.connect({
                addr: port,
                authtoken: process.env.NGROK_AUTH_TOKEN,
            });
            console.log(`Slack Bolt app is running! URL: ${url}`);
        }
        catch (error) {
            console.error(error);
        }
    });
}
start();
