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
        parentFolderId: bundle.inputData.parent_folder
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
        duplicateValidationStrategy: 'RETURN_EXISTING',
        duplicateValidationScope: 'EXACT_FOLDER'
      }
    });
  }

  function checkImportStatus(taskId) {
    return z.request({
      url: `${baseUrl}/files/v3/files/import-from-url/async/tasks/${taskId}/status`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bundle.authData.access_token}`,
      },
      params: {}
    }).then(response => {
      const json = response.json;
      let status = json.status;
      return status == 'COMPLETE' ? json.result : null;
    });
  }

  function searchFilesRequest(folderId) {
    return z.request({
      url: `${baseUrl}/files/v3/files/search`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bundle.authData.access_token}`,
      },
      params: {
        parentFolderId: folderId
      }
    })
      .then(response => {
        return response.json.results;
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

  function createFile(file, name, parentFolderId, shouldReturnUrl) {
    return new Promise(async (resolve) => {
      let taskId = await uploadFileRequest(file, name, parentFolderId)
        .then((response) => {
          response.throwForStatus();
          const result = response.json;
          z.console.log(result);
          return result.id
        });
      if (shouldReturnUrl == true) {
        let intervalID = setInterval(async () => {
          const file = await checkImportStatus(taskId);
          if (file != null) {
            clearInterval(intervalID);
            resolve(objectFromFile(file));
          }
        }, 1000);
      } else {
        resolve({});
      }
    });
  }

  function retreiveFile(file, shouldReturnUrl) {
    return new Promise(resolve => {
      if (shouldReturnUrl) {
        resolve(objectFromFile(file));
      } else {
        resolve({});
      }
    })
  }

  function objectFromFile(file) {
    return {
      fileId: file.id,
      fileUrl: file.url,
      fileType: file.type,
      fileWidth: file.width,
      fileHeight: file.height
    }
  }

  const searchFilesInFolder = (folderId) => {
    return searchFilesRequest(folderId)
    .then(data => {
      return data.map(x => {
        return {
          id: x.id,
          name: `${x.name}.${x.extension}`,
          url: x.url,
          type: x.type,
          width: x.width,
          height: x.height
        }
      });
    })
  };

  async function main() {
    if (bundle.inputData.attachments == null || bundle.inputData.attachments.length == 0) {
      return {}
    }
    const folderId = await createFolder();
    const filesInFolder = await searchFilesInFolder(folderId);
    z.console.log(filesInFolder);
    var promises = [];
    bundle.inputData.attachments.forEach(attachment => {
      let existFile = filesInFolder.find(file => attachment.name == file.name)
      if (existFile != null) {
        promises.push(retreiveFile(existFile, bundle.inputData.should_return_url));
      } else {
        promises.push(createFile(attachment.file, attachment.name, folderId, bundle.inputData.should_return_url));
      }
    });

    var files = await Promise.all(promises);
    z.console.log(files);

    return {
      folderId,
      attachments: bundle.inputData.attachments,
      files
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
        key: 'parent_folder',
        label: 'Parent folder ID',
        type: 'string',
        dynamic: 'fetch_folders.id.name',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
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
            required: false,
            list: false,
            altersDynamicFields: false,
          },
          {
            key: 'name',
            label: 'Name',
            type: 'string',
            required: false,
            list: false,
            altersDynamicFields: false,
          },
          {
            key: 'file',
            label: 'file',
            type: 'string',
            required: false,
            list: false,
            altersDynamicFields: false,
          },
        ],
        label: 'Attachments',
        required: false,
        altersDynamicFields: false,
      },
      {
        key: 'should_return_url',
        label: 'Should return file URL',
        type: 'boolean',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: perform,
  },
};
