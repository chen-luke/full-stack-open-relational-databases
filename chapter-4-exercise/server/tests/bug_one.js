const { describe, it, before, after } = require('node:test')
const assert = require('node:assert')
const axios = require('axios')
const { baseUrl, resetAndSeed, createUser, login } = require('./helper')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Shared test data for all tests in this file
let testData
let createdBlogId
let sessionUser

// Single setup for the entire test file
before(async () => {
    testData = await resetAndSeed()

    // Create session user
    sessionUser = await createUser('session@example.com', 'Session User', 'sessionpass')

    // Create a blog for reading list tests
    const newBlog = {
        title: 'Test Blog for Reading List',
        author: 'Reading List Author',
        url: 'https://example.com/reading-list-blog'
    }

    const blogResponse = await axios.post(`${baseUrl}/blogs`, newBlog, {
        headers: { Authorization: `Bearer ${testData.tokens[0]}` }
    })
    createdBlogId = blogResponse.data.id
})

describe('Integration: Reading Lists and Sessions', () => {
    let integrationBlogId
    let integrationReadingListId
    let integrationToken

    it('create blog and add to reading list', async () => {
        integrationToken = await login('test2@example.com', 'password456')

        const newBlog = {
            title: 'Integration Test Blog',
            author: 'Integration Author',
            url: 'https://example.com/integration'
        }

        const blogResponse = await axios.post(`${baseUrl}/blogs`, newBlog, {
            headers: { Authorization: `Bearer ${integrationToken}` }
        })
        integrationBlogId = blogResponse.data.id

        const readingListEntry = {
            blogId: integrationBlogId,
            userId: testData.users[1].id
        }

        const response = await axios.post(`${baseUrl}/readinglists`, readingListEntry)

        assert.ok([200, 201].includes(response.status))
        assert.strictEqual(response.data.blog_id, integrationBlogId)
        integrationReadingListId = response.data.id
    })

    it('can mark blog as read with valid session', async () => {
        const response = await axios.put(
            `${baseUrl}/readinglists/${integrationReadingListId}`,
            { read: true },
            { headers: { Authorization: `Bearer ${integrationToken}` } }
        )

        assert.ok([200, 201].includes(response.status))
        assert.strictEqual(response.data.read, true)
    })

    it('cannot mark blog as read after session expires (logout)', async () => {
        await axios.delete(`${baseUrl}/logout`, {
            headers: { Authorization: `Bearer ${integrationToken}` }
        })

        try {
            await axios.put(
                `${baseUrl}/readinglists/${integrationReadingListId}`,
                { read: false },
                { headers: { Authorization: `Bearer ${integrationToken}` } }
            )
            assert.fail('Should have thrown an error')
        } catch (error) {
            assert.strictEqual(error.response.status, 401)
        }
    })

    it('new session allows access to reading list operations again', async () => {
        await sleep(1100)
        const newToken = await login('test2@example.com', 'password456')

        const response = await axios.put(
            `${baseUrl}/readinglists/${integrationReadingListId}`,
            { read: false },
            { headers: { Authorization: `Bearer ${newToken}` } }
        )

        assert.ok([200, 201].includes(response.status))
        assert.strictEqual(response.data.read, false)
    })
})