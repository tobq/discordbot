import fetch, {Response} from "node-fetch";
import {getRequiredEnvVar} from "./env";
import {generateMessage, MESSAGE_TEMPLATE} from "./message";
import {allFulfilled, cleanDuplicates, sleep} from "./utils";

const token = getRequiredEnvVar("DISCORD_PERSONAL_TOKEN");

const API = "https://discord.com/api/v10";

function get(path: string, headers?: { [key: string]: string }) {
    return checkResponse(fetch(API + path, {
        headers: {
            ...headers,
            Authorization: token
        }
    }));
}

class AlreadyReachedOut extends Error {
}

const DEFAULT_HEADERS = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-US,en;q=0.9,en-GB;q=0.8",
    "content-length": "37",
    "cookie": "__dcfduid=caff3de0470011ec8fc81520951c9014; __sdcfduid=caff3de1470011ec8fc81520951c90144215a272a79256eeca581f18a2ea634dea87790f717723ed04d67acaf8eb4ed0; _ga=GA1.2.1764828944.1637621506; OptanonAlertBoxClosed=2022-04-02T15:52:00.632Z; _gcl_au=1.1.1186784738.1659478572; __cfruid=532a3ef24e96d6bdb347d594c11d367fcfa4bf65-1659502150; _gid=GA1.2.1188257796.1660187709; OptanonConsent=isIABGlobal=false&datestamp=Thu+Aug+11+2022+04%3A15%3A09+GMT%2B0100+(British+Summer+Time)&version=6.33.0&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1&AwaitingReconsent=false&geolocation=%3B; locale=en-GB; __cf_bm=JPo4O1_7.g1BtIdWHtCfASZtWXQuCxrc7DAgFX0XnVI-1660244538-0-ASdzv3nCzzcFD38gkQNvxVxqSlCsQlm5YtSXbI1axGfkjFSTaQ+3mAb/2E71JB75l4+V0UIlbOdmFBCBSEVZlg5HBZ4glan0xgeDOAE6rGqgmMjBBt5B6qpsJuUEHi727w==",
    "origin": "https://discord.com",
    "referer": "https://discord.com/channels/870745773732683816/880570022731350157",
    "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
    "x-context-properties": "e30=",
    "x-debug-options": "bugReporterEnabled",
    "x-discord-locale": "en-GB",
    "x-super-properties": "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMy4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTAzLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL3d3dy5nb29nbGUuY29tLyIsInJlZmVycmluZ19kb21haW4iOiJ3d3cuZ29vZ2xlLmNvbSIsInNlYXJjaF9lbmdpbmUiOiJnb29nbGUiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTQxMjMyLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
}

async function post(path: string, body: any, headers?: { [key: string]: string }) {
    return checkResponse(fetch(API + path, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            ...DEFAULT_HEADERS,
            ...headers,
            "content-type": "application/json",
            authorization: token,

        }
    }));
}

async function checkResponse(responsePromise: Promise<Response>): Promise<any> {
    let response = await responsePromise;
    if (!response.ok) throw await response.json();
    return response.json();
}

async function createDm(recipientId: string) {
    return post("/users/@me/channels", {recipients: [recipientId]});
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
    console.log("Attempting to reach out to user: " + recipientId)
    let channel = await createDm(recipientId);
    if (channel.last_message_id !== null)
        throw new AlreadyReachedOut("Already reached out to user: " + recipientId);

    const messages = generateMessages()
    for (let message of messages) {
        await sendMessage(channel.id, message);
        await sleep(3000 + Math.random() * 2000)
    }
}

function generateMessages() {
    return MESSAGE_TEMPLATE.map(generateMessage);
}

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


getSamplePosters(guildId)
    .then(async posterIds => {
        for (let posterId of posterIds) {
            try {
                await reachOut(posterId)
                console.error("Completed Reach out to:", posterId)
                await sleep(20_000 + Math.random() * 10_000)
            } catch (e) {
                console.error("FAILED TO REACH OUT TO:", posterId, e)

                // @ts-ignore
                if (e instanceof AlreadyReachedOut || e.code === 50007) {
                    await sleep(1000 + Math.random() * 2_000)
                } else {
                    throw e;
                }
            }
        }
    })
    .catch(console.error);

// console.log(generateMessages().join("\n\n"))