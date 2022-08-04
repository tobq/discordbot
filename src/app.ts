import fetch, {Response} from "node-fetch";
import {getRequiredEnvVar} from "./env";
import {generateMessage, MESSAGE_TEMPLATE} from "./message";
import {allFulfilled, cleanDuplicates, sleep} from "./utils";

const token = getRequiredEnvVar("DISCORD_PERSONAL_TOKEN");

const API = "https://discord.com/api/v10";

function get(path: string) {
    return checkResponse(fetch(API + path, {
        headers: {
            Authorization: token
        }
    }));
}

async function post(path: string, body: any, headers?: { [key: string]: string }) {
    return checkResponse(fetch(API + path, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            ...headers,
            "content-type": "application/json",
            authorization: token
        }
    }));
}

async function checkResponse(responsePromise: Promise<Response>): Promise<any> {
    let response = await responsePromise;
    if (!response.ok) throw await response.json();
    return response.json();
}

async function createDm(recipientId: string) {
    return post("/users/@me/channels", {recipient_id: recipientId});
}

function sendMessage(channelId: string, content: string) {
    return post(`/channels/${channelId}/messages`, {content: content});
}

async function sendDm(recipientId: string, content: string) {
    let channel = await createDm(recipientId);
    await sendMessage(channel.id, content)
}

// sendDm("737778667278565510", "TEST DM")
//     // get("/users/@me/channels")
//     .then(console.log)

async function reachOut(recipientId: string) {
    let channel = await createDm(recipientId);
    if (channel.last_message_id !== null)
        throw new Error("Already reached out to user: " + recipientId);

    const messages = generateMessages()
    for (let message of messages) {
        await sendMessage(channel.id, message);
        await sleep(2000 + Math.random() * 2000)
    }
}

function generateMessages() {
    return MESSAGE_TEMPLATE.map(generateMessage);
}

// for (let i = 0; i < 10; i++) {
//     console.log(generateMessages().join("\n\n"))
//     console.log("\n\n\n\n")
// }


// reachOut("178569793106870273")
// get("/channels//messages")
// get("/guilds/652539917666353170/roles")
//     .then(console.log)
// let guildId = `652539917666353170`;
let guildId = `947530762381578330`;

async function getSamplePosters(guildId: string) {
    const channels = await get(`/guilds/${guildId}/channels`);
    const sampleChannels = channels.filter(isSampleChannel);

    /* TODO: figure out how to find channels we have access to - instead of ignoring 403*/
    const channelMessages = await allFulfilled(sampleChannels.map(async (channel: any) => {

        const messages = await get(`/channels/${channel.id}/messages?limit=100`);
        console.log(`Found ${messages.length} messages for channel: ${channel.id} - ${channel.name}`)
        return messages;
    }));

    const sampleMessages = cleanDuplicates(channelMessages.flat(), (message: any) => message.id)
        .filter(isSampleMessage);

    const posterIds = cleanDuplicates(sampleMessages.map((message: any) => message.author.id), i => i);
    console.log(`Found ${sampleMessages.length} sample/kit messages from ${posterIds.length} posters for guild: ${guildId}`)
    return posterIds;
}

const SAMPLE_CHANNEL_TAGS = [
    "sample",
    "collab",
    "share",
    "kits",
    "sounds",
    "loops"
]

function isSampleMessage(message: any): boolean {

    return /(.* )?https?:\/\//.test(message.content) || message.attachments?.length !== 0;
}

function isSampleChannel(channel: any): boolean {

    const name: string | null | undefined = channel.name;
    return !!name && SAMPLE_CHANNEL_TAGS.some(t => name.includes(t));
}


// getSamplePosters(guildId)
//     .then(async posterIds => {
//         for (let posterId of posterIds) {
//             try {
//                 await reachOut(posterId)
//                 console.error("Completed Reach out to:", posterId)
//             } catch (e) {
//                 console.error("FAILED TO REACH OUT TO:", posterId, e)
//             }
//             await sleep(5000 + Math.random() * 3000)
//         }
//     })
//     .catch(console.error);

console.log(generateMessages().join("\n\n"))