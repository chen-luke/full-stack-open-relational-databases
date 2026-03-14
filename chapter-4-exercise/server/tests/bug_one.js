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

describe('Reading Lists API', () => {
    it('can add a blog to reading list', async () => {

        console.log('What is the blogId?', createdBlogId)
        console.log('What is the userId?', testData.users[0].id)

        const readingListEntry = {
            blogId: createdBlogId,
            userId: testData.users[0].id
        }

        const response = await axios.post(`${baseUrl}/readinglists`, readingListEntry)

        assert.ok([200, 201].includes(response.status))
        assert.strictEqual(response.data.blog_id, createdBlogId)
        assert.strictEqual(response.data.user_id, testData.users[0].id)
        assert.strictEqual(response.data.read, false)
    })

    it('cannot add same blog to reading list twice', async () => {
        const readingListEntry = {
            blogId: createdBlogId,
            userId: testData.users[0].id
        }

        try {
            await axios.post(`${baseUrl}/readinglists`, readingListEntry)
            assert.fail('Should have thrown an error')
        } catch (error) {
            assert.strictEqual(error.response.status, 400)
        }
    })

    it('returns 400 when blogId is missing', async () => {
        const readingListEntry = {
            userId: testData.users[0].id
        }

        try {
            await axios.post(`${baseUrl}/readinglists`, readingListEntry)
            assert.fail('Should have thrown an error')
        } catch (error) {
            assert.strictEqual(error.response.status, 400)
        }
    })

    it('returns 400 when userId is missing', async () => {
        const readingListEntry = {
            blogId: createdBlogId
        }

        try {
            await axios.post(`${baseUrl}/readinglists`, readingListEntry)
            assert.fail('Should have thrown an error')
        } catch (error) {
            assert.strictEqual(error.response.status, 400)
        }
    })

    it('returns 404 when blog does not exist', async () => {
        const readingListEntry = {
            blogId: 99999,
            userId: testData.users[0].id
        }

        try {
            await axios.post(`${baseUrl}/readinglists`, readingListEntry)
            assert.fail('Should have thrown an error')
        } catch (error) {
            assert.strictEqual(error.response.status, 404)
        }
    })

    it('returns 404 when user does not exist', async () => {
        const readingListEntry = {
            blogId: createdBlogId,
            userId: 99999
        }

        try {
            await axios.post(`${baseUrl}/readinglists`, readingListEntry)
            assert.fail('Should have thrown an error')
        } catch (error) {
            assert.strictEqual(error.response.status, 404)
        }
    })

    it('user can view their reading list', async () => {
        const response = await axios.get(`${baseUrl}/users/${testData.users[0].id}`)

        assert.ok([200, 201].includes(response.status))
        assert.strictEqual(response.data.name, testData.users[0].name)
        assert.strictEqual(response.data.username, testData.users[0].username)
        assert.ok(Array.isArray(response.data.readings))
        assert.ok(response.data.readings.length > 0)

        const reading = response.data.readings[0]
        assert.ok(reading.id)
        assert.ok(reading.title)
        assert.ok(reading.author)
        assert.ok(reading.url)
        assert.ok(reading.reading_list)
        assert.strictEqual(typeof reading.reading_list.read, 'boolean')
    })

    it('user can filter reading list by read status', async () => {
        const responseUnread = await axios.get(`${baseUrl}/users/${testData.users[0].id}?read=false`)
        assert.ok([200, 201].includes(responseUnread.status))

        const responseRead = await axios.get(`${baseUrl}/users/${testData.users[0].id}?read=true`)
        assert.ok([200, 201].includes(responseRead.status))

        // All readings should be unread at this point
        assert.ok(responseUnread.data.readings.length > 0)
        assert.strictEqual(responseRead.data.readings.length, 0)
    })

    it('user can mark a blog as read with authentication', async () => {
        const userResponse = await axios.get(`${baseUrl}/users/${testData.users[0].id}`)
        const readingListId = userResponse.data.readings[0].reading_list.id

        const response = await axios.put(
            `${baseUrl}/readinglists/${readingListId}`,
            { read: true },
            { headers: { Authorization: `Bearer ${testData.tokens[0]}` } }
        )

        assert.ok([200, 201].includes(response.status))
        assert.strictEqual(response.data.read, true)
    })

    it('marking as read requires authentication', async () => {
        const userResponse = await axios.get(`${baseUrl}/users/${testData.users[0].id}`)
        const readingListId = userResponse.data.readings[0].reading_list.id

        try {
            await axios.put(
                `${baseUrl}/readinglists/${readingListId}`,
                { read: false }
            )
            assert.fail('Should have thrown an error')
        } catch (error) {
            assert.strictEqual(error.response.status, 401)
        }
    })

    it('user can only mark their own reading list entries', async () => {
        const userResponse = await axios.get(`${baseUrl}/users/${testData.users[0].id}`)
        const readingListId = userResponse.data.readings[0].reading_list.id

        try {
            await axios.put(
                `${baseUrl}/readinglists/${readingListId}`,
                { read: false },
                { headers: { Authorization: `Bearer ${testData.tokens[1]}` } }
            )
            assert.fail('Should have thrown an error')
        } catch (error) {
            assert.strictEqual(error.response.status, 401)
        }
    })

    it('returns 404 when marking non-existent reading list entry', async () => {
        try {
            await axios.put(
                `${baseUrl}/readinglists/99999`,
                { read: true },
                { headers: { Authorization: `Bearer ${testData.tokens[0]}` } }
            )
            assert.fail('Should have thrown an error')
        } catch (error) {
            assert.strictEqual(error.response.status, 404)
        }
    })

    it('verified that blog is now marked as read', async () => {
        const responseRead = await axios.get(`${baseUrl}/users/${testData.users[0].id}?read=true`)
        assert.ok([200, 201].includes(responseRead.status))
        assert.ok(responseRead.data.readings.length > 0)

        const responseUnread = await axios.get(`${baseUrl}/users/${testData.users[0].id}?read=false`)
        assert.ok([200, 201].includes(responseUnread.status))
        assert.strictEqual(responseUnread.data.readings.length, 0)
    })
})