const errors = require("../errors/errors");
const CustomError = errors.customError;
const moment = require('moment');

const perform = async (z, bundle) => {
    const baseUrl = 'https://api.hubapi.com';

    function fetchPublishingChannelsRequest() {
        return z.request({
            url: `${baseUrl}/broadcast/v1/channels/setting/publish/current`,
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            params: {
            }
        })
    }

    const fetchPublishingChannels = async () => {
        let result = await fetchPublishingChannelsRequest()
            .then(res => {
                res.throwForStatus();
                return res.json.map(x => {
                    return {
                        channelId: x.channelId,
                        channelGuid: x.channelGuid,
                        type: x.accountType,
                        channelType: x.channelType,
                        name: x.name
                    }
                })
            });
        return result;
    };

    const createSocialPost = (content, medias, channel, publish_time) => {
        return new Promise(async (resolve, reject) => {
            let contentPayload = {
                body: content
            }
            if (medias.length > 0) {
                contentPayload.photoUrl = medias[0].url
            }
            var payload = {
                channelGuid: channel.channelGuid,
                content: contentPayload
            }
            if (publish_time == null) {
                payload.status = 'DRAFT'
            } else {
                payload.triggerAt = moment(publish_time).valueOf().toString()
            }
            z.console.log(payload);
            resolve(await z.request({
                url: `${baseUrl}/broadcast/v1/broadcasts`,
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${bundle.authData.access_token}`,
                },
                body: payload
            }).then(res => {
                return res.json;
            }));
        });
    }

    const createSocialPosts = async (content, medias, channels, publish_time) => {
        const promises = [];
        channels.forEach(
            channel => {
                promises.push(createSocialPost(content, medias, channel, publish_time));
            }
        );
        const responses = await Promise.all(promises);
        return responses;
    }

    async function main() {
        const publishingChannels = await fetchPublishingChannels();

        let inputChannels = bundle.inputData.channels;
        var selectedPublishingChannels = []
        inputChannels.forEach(element => {
            let channel = publishingChannels.find(x => x.channelType == element.type && x.name == element.name)
            if (channel != null) {
                selectedPublishingChannels.push(channel);
            }
        });

        z.console.log(selectedPublishingChannels);

        if (bundle.inputData.medias.length > 1) {
            errors.throwError(z, new CustomError(102))
        }

        const socialPosts = await createSocialPosts(bundle.inputData.content, bundle.inputData.medias, selectedPublishingChannels, bundle.inputData.publish_time);

        let data = {
            token: bundle.authData.access_token,
            selectedPublishingChannels,
            socialPosts
        };
        return data;
    };

    return main();
};

module.exports = {
    key: 'create_social_post',
    noun: 'Social post',
    display: {
        label: 'Create social post',
        description: 'Create social post on HubSpot',
        hidden: false,
        important: true,
    },
    operation: {
        inputFields: [
            {
                key: 'content',
                label: 'Social Post Content',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'publish_time',
                label: 'Scheduled publish time',
                description: 'Leave it empty will set the post as DRAFT.',
                type: 'datetime',
                required: false,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'medias',
                children: [
                    {
                        key: 'url',
                        label: 'Media URL',
                        type: 'string',
                        required: true,
                        list: false,
                        altersDynamicFields: false,
                    }
                ],
                label: 'Media URLs',
                required: true,
                altersDynamicFields: false,
            },
            {
                key: 'channels',
                children: [
                    {
                        key: 'type',
                        label: 'Channel Type',
                        type: 'string',
                        required: true,
                        list: false,
                        altersDynamicFields: false,
                    },
                    {
                        key: 'name',
                        label: 'Name',
                        type: 'string',
                        required: true,
                        list: false,
                        altersDynamicFields: false,
                    }
                ],
                label: 'Channels',
                required: true,
                altersDynamicFields: false,
            },
        ],
        perform: perform,
    }
};