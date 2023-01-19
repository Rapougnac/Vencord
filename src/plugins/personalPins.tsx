/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


import * as DataStore from "@api/DataStore";
import { Devs } from "@utils/constants";
import { useAwaiter } from "@utils/misc";
import definePlugin from "@utils/types";
import { waitFor } from "@webpack";
import { Menu, React } from "@webpack/common";
import { Channel, Message } from "discord-types/general";

let WrapperHeaderIcon;
waitFor(
    e => e?.toString?.().includes("function n(){R(this,n);var e"),
    m => (WrapperHeaderIcon = m)
);
let InnerChildWrapper;
waitFor(["JO", "ZP", "iz"], m => (InnerChildWrapper = m.JO));
// let InnerInnerChild;
// waitFor(
//     e =>
//         e
//             ?.toString?.()
//             .includes(
//                 "n(){f(this,n);var e;(e=t.apply(this,arguments)).handleKeyPress=function(t){var"
//             ),
//     m => (InnerInnerChild = m)
// );

export default definePlugin({
    name: "PersonalPins",
    description: "Allows you to pin messages and see them everywhere",
    authors: [Devs.Rapougnac],
    dependencies: ["MenuItemDeobfuscatorAPI"],
    patches: [
        {
            find: 'id:"pin",',
            replacement: {
                match: /id:"pin",.{0,124},/,
                replace(m) {
                    return `${m}Vencord.Plugins.plugins.PersonalPins.addItemToMessageMenu(arguments[0]),`;
                },
            },
        },
        {
            find: '},"pins"));',
            replacement: {
                match: /\},"pins"\)\);/g,
                replace(m) {
                    return `${m}l.push((0, r.jsx)(Vencord.Plugins.plugins.PersonalPins.renderLocalPinsIcon,{channel:n},"local-pins"));`;
                },
            },
        },
        {
            find: "REMOVE_ALL_REACTIONS_CONFIRM_BODY",
            all: true,
            replacement: {
                match: /,F=\(0,ve\.Z\)\((\w),(\w)\)/,
                replace(m, arg1, arg2) {
                    return `${m},personalPinsMenuItem=Vencord.Plugins.plugins.PersonalPins.addItemToGlobalMenu(${arg1},${arg2})`;
                }
            }
        },
        {
            find: "REMOVE_ALL_REACTIONS_CONFIRM_BODY",
            all: true,
            replacement: {
                match: /children:arguments\[0\]\.message\.deleted\?\[\]:\[.+,(F),.+\]}\),/,
                replace(m, arg1) {
                    return `${m.substring(0, m.indexOf(arg1) + 2)}personalPinsMenuItem,${m.substring(m.indexOf(arg1) + 2)}`;
                }
            }
        }
    ],

    addItemToMessageMenu(messageInfos: MessageInformations) {
        return (
            <Menu.MenuItem
                id="local-pin"
                label="Locally Pin Message"
                action={() => { }}
                icon={discordProps => <TestIcon {...discordProps} />}
            />
        );
    },

    addItemToGlobalMenu(channel: Channel, message: Message) {
        return (
            <Menu.MenuItem
                id="local-pin"
                label="Locally Pin Message"
                action={() => console.log("Hello global menu")}
                icon={discordProps => <TestIcon {...discordProps} />}
            />
        );
    },

    pinMessageLocally() {
        const [locallyPinnedMessages, , isPending] = useAwaiter(() =>
            DataStore.get<{ [key: string]: Message; }>(
                "PersonalPins_pinnedMessages"
            )
        );
        if (isPending) return;
        console.log(locallyPinnedMessages);
    },

    renderLocalPinsIcon({ channel }: { channel: Channel; }) {
        return (
            <WrapperHeaderIcon
                aria-label="Locally Pinned Messages"
                label="Locally Pinned Messages"
                tooltip="Locally Pinned Messages"
                align="right"
                icon={TestIcon}
            >
                {discordProps => (
                    <InnerChildWrapper
                        {...discordProps}
                        label="Locally Pinned Messages"
                        tooltip="Locally Pinned Messages"
                        aria-label="Locally Pinned Messages"
                        icon={TestIcon}
                    />
                )}
            </WrapperHeaderIcon>
        );
    },
});

function TestIcon(props) {
    return (
        <svg {...props} name="Note" width="24" height="24" viewBox="0 0 24 24"><mask /><path fill="currentColor" mask="url(#pinIconMask)" d="M 6.7285156 2 C 6.4051262 2 6.1425781 2.2615247 6.1425781 2.5859375 L 6.1425781 3.7578125 C 6.1425781 4.081202 6.4041028 4.34375 6.7285156 4.34375 C 7.0529284 4.34375 7.3144531 4.0822254 7.3144531 3.7578125 L 7.3144531 2.5859375 C 7.3144531 2.2615247 7.0529284 2 6.7285156 2 z M 10.244141 2 C 9.9207511 2 9.6582031 2.2615247 9.6582031 2.5859375 L 9.6582031 3.7578125 C 9.6582031 4.081202 9.9197277 4.34375 10.244141 4.34375 C 10.568554 4.34375 10.830078 4.0822254 10.830078 3.7578125 L 10.830078 2.5859375 C 10.830078 2.2615247 10.568554 2 10.244141 2 z M 13.759766 2 C 13.436377 2 13.173828 2.2615247 13.173828 2.5859375 L 13.173828 3.7578125 C 13.173828 4.081202 13.435354 4.34375 13.759766 4.34375 C 14.083156 4.34375 14.347656 4.0822254 14.347656 3.7578125 L 14.347656 2.5859375 C 14.346656 2.2615247 14.083156 2 13.759766 2 z M 17.275391 2 C 16.952002 2 16.689453 2.2615247 16.689453 2.5859375 L 16.689453 3.7578125 C 16.689453 4.081202 16.950979 4.34375 17.275391 4.34375 C 17.598781 4.34375 17.863281 4.0822254 17.863281 3.7578125 L 17.863281 2.5859375 C 17.862281 2.2615247 17.598781 2 17.275391 2 z M 4.9667969 3.2792969 C 4.2903399 3.5228623 3.8007813 4.1662428 3.8007812 4.9296875 L 3.8007812 20.242188 C 3.8007812 21.211333 4.5884253 22 5.5585938 22 L 18.447266 22 C 19.41641 22 20.205078 21.212356 20.205078 20.242188 L 20.205078 4.9296875 C 20.204054 4.1662428 19.713754 3.5228623 19.033203 3.2792969 L 19.033203 3.7578125 C 19.033203 4.7269575 18.245559 5.515625 17.275391 5.515625 C 16.306246 5.515625 15.517578 4.7279808 15.517578 3.7578125 C 15.517578 4.7269575 14.72798 5.515625 13.757812 5.515625 C 12.788668 5.515625 12 4.7279808 12 3.7578125 C 12 4.7269575 11.212357 5.515625 10.242188 5.515625 C 9.2730428 5.515625 8.484375 4.7279808 8.484375 3.7578125 C 8.484375 4.7269575 7.6967309 5.515625 6.7265625 5.515625 C 5.7574176 5.515625 4.9667969 4.7279808 4.9667969 3.7578125 L 4.9667969 3.2792969 z M 6.7285156 7.2734375 L 17.275391 7.2734375 C 17.598781 7.2734375 17.861328 7.5349622 17.861328 7.859375 C 17.861328 8.1837878 17.598781 8.4453125 17.275391 8.4453125 L 6.7285156 8.4453125 C 6.4051262 8.4453125 6.1425781 8.1837878 6.1425781 7.859375 C 6.1425781 7.5349622 6.4041028 7.2734375 6.7285156 7.2734375 z M 6.7285156 10.787109 L 17.275391 10.787109 C 17.598781 10.787109 17.861328 11.050587 17.861328 11.375 C 17.861328 11.699413 17.598781 11.960938 17.275391 11.960938 L 6.7285156 11.960938 C 6.4051262 11.960938 6.1425781 11.699413 6.1425781 11.375 C 6.1425781 11.050587 6.4041028 10.787109 6.7285156 10.787109 z M 6.7285156 14.380859 L 17.275391 14.380859 C 17.598781 14.380859 17.861328 14.642384 17.861328 14.966797 C 17.861328 15.29121 17.598781 15.552734 17.275391 15.552734 L 6.7285156 15.552734 C 6.4051262 15.552734 6.1425781 15.29121 6.1425781 14.966797 C 6.1425781 14.643408 6.4041028 14.380859 6.7285156 14.380859 z M 6.7285156 17.896484 L 17.275391 17.896484 C 17.598781 17.896484 17.861328 18.158009 17.861328 18.482422 C 17.861328 18.806835 17.598781 19.068359 17.275391 19.068359 L 6.7285156 19.068359 C 6.4051262 19.068359 6.1425781 18.806835 6.1425781 18.482422 C 6.1425781 18.159033 6.4041028 17.896484 6.7285156 17.896484 z" /></svg>
    );
}

const LocalPinsWrapperIcon: React.FC<{ channel: Channel; }> = ({ channel }) => {
    return <TestIcon key={"local-pin"} />;
};

export interface MessageInformations {
    canConfigureJoin: boolean;
    canCopy: boolean;
    canDelete: boolean;
    canPin: boolean;
    canPublish: boolean;
    canReply: boolean;
    canReport: boolean;
    canSpeakMessage: boolean;
    canStartThread: boolean;
    channel: Channel;
    hasDeveloperMode: boolean;
    hasReactions: boolean;
    isGuildInviteReminder: boolean;
    isMessageTODO: boolean;
    isSpeakingMessage: boolean;
    message: Message;
    onClose: () => void;
    showMessageTODOActions: boolean;
    updatePosition: () => any;
}

interface ChildHeaderComponentProps {
    renderPopout: () => JSX.Element;
    animation: string;
    animationPosition: string;
    children: JSX.Element[] | JSX.Element;
    shouldShow: boolean;
    closeOnScroll: boolean;
    onShiftClick: () => any;
    useMouseEnter: boolean;
}

var identifierRegex = /^[A-Za-z_$]\w*$/;
function getType(v, indent) {
    switch (typeof v) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "symbol":
            return typeof v + ";";
        case "function":
            if (v.length) {
                if (v.length > 10) return "(...args: any[]) => any;";
                return `(${Array.from(
                    { length: v.length },
                    (_, i) => `p${i}: any`
                ).join(", ")}) => any;`;
            }
            const str = v.toString();
            const mightHaveVarArgs =
                str === "function () { [native code] }" ||
                str.includes("arguments") ||
                /\(.+?\.{3}.+?\)/.test(str);
            if (mightHaveVarArgs) return "(...args: any[]) => any;";
            return "() => any;";
        case "object":
            if (v === null) return "any | null";
            return genInterface(v, true, indent + "    ");
        case "undefined":
            return "any | undefined;";
        default:
            throw new Error("??");
    }
}

function genInterface(obj, isInner = false, indent = "    ") {
    let inter = `${isInner ? "" : "interface RootObject "}{\n`;
    for (const key in obj) {
        const sanitizedKey = identifierRegex.test(key)
            ? key
            : JSON.stringify(key);
        inter += `${indent}${sanitizedKey}: ${getType(obj[key], indent)}\n`;
    }
    return `${inter}${indent.slice(4)}};`;
}
