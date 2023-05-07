const perform = async (z, bundle) => {
    const baseUrl = 'https://api.hubapi.com';

    function createTagsRequest(tags, language) {
        var bodies = [];
        tags.forEach(
            tag => {
                let body = {
                    'name': tag.name,
                    'language': language
                }
                bodies.push(body);
            });
        return z.request({
            url: `${baseUrl}/cms/v3/blogs/tags/batch/create`,
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            body: {
                'inputs': bodies
            }
        })
    }

    function findTagRequest(tag, language) {
        return z.request({
            url: `${baseUrl}/cms/v3/blogs/tags`,
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            params: {
                'language__in': language,
                'name__eq': tag.name
            }
        });
    }

    async function findTags(tags, language) {
        const promises = [];
        tags.forEach(
            tag => {
                promises.push(findTagRequest(tag, language));
            }
        );
        const responses = await Promise.all(promises);
        return responses.map((res) => res.data);
    }

    const createTags = async (tags, language) => {
        const tagIds = [];
        return await findTags(tags, language)
            .then(responses => {
                responses.forEach(response => {
                    if (response.results.length > 0) {
                        let result = response.results[0];
                        tagIds.push({
                            id: response.results[0].id,
                            name: response.results[0].name
                        })
                    }
                });
                return tags.filter(value => !tagIds.map(x => x.name).includes(value.name));
            })
            .then(tagsToCreate => {
                if (tagsToCreate.length == 0) {
                    return tagIds;
                } else {
                    return createTagsRequest(tagsToCreate, language);
                }
            })
            .then(response => {
                if (response.json != null) {
                    tagIds.push(...response.json.results.map(x => {
                        return {
                            id: x.id,
                            name: x.name
                        }
                    }));
                }
                return tagIds;
            });
    };

    function findAuthorRequest(authorEmail, language) {
        return z.request({
            url: `${baseUrl}/cms/v3/blogs/authors`,
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            params: {
                'language__in': language,
                'email__eq': authorEmail
            }
        });
    }

    function createAuthorRequest(authorEmail, authorName, language) {
        return z.request({
            url: `${baseUrl}/cms/v3/blogs/authors`,
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            body: {
                'fullName': authorName,
                'email': authorEmail,
                'language': language
            }
        });
    }

    const createAuthor = (authorEmail, authorName, language) => {
        return findAuthorRequest(authorEmail, language)
            .then(response => {
                const json = response.json;
                return json.total > 0 ? json.results[0].id : null;
            })
            .then(authorId => {
                if (authorId == null) {
                    return createAuthorRequest(authorEmail, authorName, language);
                } else {
                    return { json: { id: authorId } }
                }
            })
            .then(response => {
                return response.json.id;
            });
    };

    function findBlogRequest(slug) {
        return z.request({
            url: `${baseUrl}/cms/v3/blogs/posts`,
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            params: {
                'slug__eq': slug
            }
        })
        .then(response => {
            let json = response.json;
            return json.results.length > 0 ? json.results[0] : null;
        });
    }

    function findContentGroupId(blog_url) {
        return z.request({
            url: `${baseUrl}/content/api/v2/blogs`,
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            }
        })
        .then(response => {
            let json = response.json.objects;
            let mainBlog = json.find(x => x.absolute_url == blog_url);
            if (mainBlog != null) {
                return mainBlog;
            } else {
                z.errors.Error('Wrong Blog Post URL', 'InvalidInputData', 100);
                return null;
            }
        });
    }

    function createOrUpdateBlogRequest(blogId, title, content, contentGroupId, author, tags, language, meta_description, slug, featuredImage, featuredImageAltText) {
        return z.request({
            url: blogId == null ? `${baseUrl}/cms/v3/blogs/posts` : `${baseUrl}/cms/v3/blogs/posts/${blogId}`,
            method: blogId == null ? 'POST' : 'PATCH',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            body: {
                'slug': slug,
                'state': 'DRAFT',
                'tagIds': tags,
                'language': language,
                'name': title,
                'postBody': content,
                'metaDescription': meta_description,
                'blogAuthorId': author,
                'contentGroupId': contentGroupId,
                'featuredImage': featuredImage,
                'featuredImageAltText': featuredImageAltText,
                'useFeaturedImage': true
            }
        });
    }

    const createBlog = async (title, content, contentGroupId, author, tags, language, meta_description, mainBlogSlug, slug, featuredImage, featuredImageAltText) => {
        var blogSlug = slug.includes("/") ? slug : `/${slug}`;
        let blog = await findBlogRequest(`${mainBlogSlug}${blogSlug}`);
        let response = await createOrUpdateBlogRequest(blog.id, title, content, contentGroupId, author, tags, language, meta_description, slug, featuredImage, featuredImageAltText);        
        return blog == null ? response.json : blog;
    };

    async function main() {
        const findMainBlogResponse = await findContentGroupId(bundle.inputData.blog_url);
        let contentGroupId = findMainBlogResponse.id;
        let language = findMainBlogResponse.language;

        const tags = await createTags(bundle.inputData.tags, language);
        z.console.log(tags);
        const author = await createAuthor(bundle.inputData.author_email, bundle.inputData.author_name, language);
        z.console.log(author);
        
        const blog = await createBlog(
            bundle.inputData.title, 
            bundle.inputData.content, 
            contentGroupId,
            author, 
            tags.map (x => x.id), 
            language,
            bundle.inputData.meta_description,
            findMainBlogResponse.slug,
            bundle.inputData.slug,
            bundle.inputData.featured_image,
            bundle.inputData.featured_image_alt_text
        );
        z.console.log(blog);
        return {
            tags,
            author,
            blog
        };
    };

    return main();
}

module.exports = {
    key: 'create_blog_post',
    noun: 'Blog',
    display: {
        label: 'Create blog post',
        description: 'Create blog post on HubSpot',
        hidden: false,
        important: true,
    },
    operation: {
        inputFields: [
            {
                key: 'title',
                label: 'Blog Title',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'content',
                label: 'Blog Content',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'blog_url',
                label: 'Blog URL',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'author_email',
                label: 'Blog Author Email',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'author_name',
                label: 'Blog Author Name',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'meta_description',
                label: 'Blog Meta Description',
                type: 'text',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'slug',
                label: 'Blog Slug URL',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'featured_image',
                label: 'Featured Image',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'featured_image_alt_text',
                label: 'Featured Image Alt Text',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: 'tags',
                children: [
                    {
                        key: 'name',
                        label: 'Name',
                        type: 'string',
                        required: false,
                        list: false,
                        altersDynamicFields: false,
                    }
                ],
                label: 'Tags',
                required: false,
                altersDynamicFields: false,
            },
        ],
        perform: perform,
    },
};
