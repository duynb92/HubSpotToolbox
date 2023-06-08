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
                    channelGuid: x.accountGuid,
                    type: x.accountType,
                    channelType: x.channelType,
                    name: x.name
                }
            })
        });
        return result;
    };

    async function main() {
        const publishingChannels = await fetchPublishingChannels();
        let data = {
            publishingChannels,
            token: bundle.authData.access_token
        };
        z.console.log(data);
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