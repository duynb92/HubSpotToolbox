const perform = async (z, bundle) => {
  const baseUrl = 'https://api.hubapi.com';
  function createFolderRequest() {
    return z.request({
      url: `${baseUrl}/files/v3/folders`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bundle.authData.access_token}`,
      },
      body: {
        name: bundle.inputData.folder,
        parentFolderId: 113364128265
      }
    });
  }

  function uploadFileRequest(url, name, parentFolderId) {
    // const fileRequest = z.request({url: url, raw: true});
    /* approach 1 */
    // return z.request({url: url, raw: true})
    // .then(stream => {
    //   return z.request({
    //     url: `${baseUrl}/files/v3/files`,
    //     method: 'POST',
    //     headers: {
    //       Accept: 'application/json',
    //       Authorization: `Bearer ${bundle.authData.access_token}`,
    //     },
    //     body: {
    //       file: stream,
    //       folderId: parentFolderId
    //     }
    //   });
    // });

    /* approach 2 */
    // return z.request({
    //   url: `${baseUrl}/files/v3/files`,
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //     Accept: 'application/json',
    //     Authorization: `Bearer ${bundle.authData.access_token}`,
    //   },
    //   body: {
    //     file: fileRequest,
    //     folderId: parentFolderId,
    //     options: {
    //       access: 'PUBLIC_INDEXABLE'
    //     }
    //   }
    // });

    /* approach 3 */
    return z.request({
      url: `${baseUrl}/files/v3/files/import-from-url/async`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bundle.authData.access_token}`,
      },
      body: {
        url: url,
        name: name,
        folderId: parentFolderId,
        access: 'PUBLIC_INDEXABLE',
        duplicateValidationStrategy: 'NONE'
      }
    });
  }

  const createFolder = () => {
    return createFolderRequest()
      .then((response) => {
        response.throwForStatus();
        const result = response.json;
        z.console.log(result);
        return result.id
      });
  }

  function createFile(file, name, parentFolderId) {
    return uploadFileRequest(file, name, parentFolderId)
      .then((response) => {
        response.throwForStatus();
        const result = response.json;
        z.console.log(result);
        return result.id
      });
  }

  async function main() {
    const folderId = await createFolder();
    bundle.inputData.attachments.forEach(async attachment => {
      const fileId = await createFile(attachment.file, attachment.name, folderId);
    });
    // var fileIds = [];
    // bundle.inputData.attachments.forEach(async attachment => {
    //   const fileId = await createFile(attachment.file, folderId);
    //   fileIds.push(fileId);
    // });

    return {
      accessToken: bundle.authData.access_token,
      folderId,
      attachments: bundle.inputData.attachments
    }
  }

  return main();
};

module.exports = {
  key: 'upload_files',
  noun: 'Files',
  display: {
    label: 'Upload files',
    description: 'Upload files to HubSpot',
    hidden: false,
    important: true,
  },
  operation: {
    inputFields: [
      {
        key: 'folder',
        label: 'Folder',
        type: 'string',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'attachments',
        children: [
          {
            key: 'id',
            label: 'ID',
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
          },
          {
            key: 'file',
            label: 'file',
            type: 'string',
            required: true,
            list: false,
            altersDynamicFields: false,
          },
        ],
        label: 'Attachments',
        required: false,
        altersDynamicFields: false,
      },
    ],
    perform: perform,
  },
};
