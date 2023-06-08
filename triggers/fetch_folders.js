const fetchFolders = async (z, bundle) => {
    return await z.request({
        url: 'https://api.hubapi.com/files/v3/folders/search',
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${bundle.authData.access_token}`,
        },
        params: {}
    }).then(response => {
        let result = response.json.results.map(x => {
            return {
                id: x.id,
                name: x.name
            }
        });
        z.console.log(result);
        return result;
    })
        
};


module.exports = {
    operation: {
        perform: fetchFolders,
        sample: {
            id: '123456',
            name: 'FolderName'
        },
        outputFields: [
            { key: 'id', label: 'id', type: 'string' },
            { key: 'name', label: 'name', type: 'string' }
        ],
    },
    key: 'fetch_folders',
    noun: 'HubSpot files folder',
    display: {
        label: 'Fetch HubSpot files folder',
        description: 'Fetch HubSpot files folder for user to select when uploading files',
        hidden: true,
        important: false,
    },
};
