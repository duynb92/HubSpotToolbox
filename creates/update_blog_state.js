const error = require('../errors/errors.js');
const moment = require('moment');
const CustomError = error.customError;

const perform = async (z, bundle) => {
    const baseUrl = 'https://api.hubapi.com';

    function updateBlogRequest(blogId, state) {
        return z.request({
            url: `${baseUrl}/cms/v3/blogs/posts/${blogId}`,
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            body: {
                'state': state.toUpperCase(),
                'publishImmediately': state.toUpperCase() == 'PUBLISHED' ? true : false
            }
        });
    }

    function scheduleBlogRequest(blogId, time) {
        return z.request({
            url: `${baseUrl}/cms/v3/blogs/posts/schedule`,
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            body: {
                'id': blogId,
                'publishDate': time
            }
        });
    }

    function findBlogRequest(title) {
        return z.request({
            url: `${baseUrl}/cms/v3/blogs/posts`,
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            params: {
                'name__eq': title
            }
        }).then(response => {
            let json = response.json;
            if (json.results.length > 0) {
                return json.results[0]
            } else {
                error.throwError(z, new CustomError(100));
                return null;
            }
        });
    }

    const updateBlogState = (blogId, state, time) => {
        if (state.toLowerCase() == 'draft') {
            return updateBlogRequest(blogId, state.toUpperCase())
                .then(response => {
                    response.throwForStatus();
                    return response.json;
                })
        } else {
            let publishTime = time == null ? moment().add(10, 's').toDate().toISOString() : time;
            return scheduleBlogRequest(blogId, publishTime)
                .then(() => {
                    return updateBlogRequest(blogId, state.toUpperCase());
                })
                .then(response => {
                    response.throwForStatus();
                    return response.json;
                })
        }
    }

    async function main() {
        if (bundle.inputData.state == 'SCHEDULED' && bundle.inputData.publish_time == null) {
            error.throwError(z, new CustomError(101))
        }
        const blog = await findBlogRequest(bundle.inputData.blog_title);
        const updatedBlog = await updateBlogState(blog.id, bundle.inputData.state, bundle.inputData.publish_time);
        let data = {
            updatedBlog
        };
        z.console.log(data);
        return data;
    }

    return main()
}

module.exports = {
    key: 'update_blog_state',
    noun: 'Blog state',
    display: {
        label: 'Update Blog post state (draft/published/scheduled)',
        description: 'Change Blog post state',
        hidden: false,
        important: true,
    },
    operation: {
        inputFields: [
            {
                key: 'blog_title',
                label: 'Blog Title',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'state',
                label: 'State',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'publish_time',
                label: 'Scheduled publish time',
                type: 'datetime',
                required: false,
                list: false,
                altersDynamicFields: false,
            }
        ],
        perform: perform,
    },
};