const { expect } = require('chai')
const request = require('supertest')
const app = require('../app')


describe('img_thumb', () => {
    const urlValid = 'https://image.shutterstock.com/image-vector/shopping-online-on-website-mobile-260nw-1206570103.jpg'
    const urlInvalid = 'https://image.shutterstock.com/imageasdf-vector/shoppingasd-online-on-website-mobile-260nw-12d0657010.asdf'
    const loginDetails = { username: 'prashant', password: 'whyShouldITellYou' }
    let token


    describe('Mocking Auth', () => {
        it('It should log in any random username and password', (done) => {
            request.agent(app)
                .post('/api/users/login')
                .send({ username: '', password: '' })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200)
                    done()
                })
        })

        it('accept a username and return a token', (done) => {
            request.agent(app)
                .post('/api/users/login')
                .send(loginDetails)
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200)
                    expect(res.body.authorized).to.equal(true)
                    token = res.body.token
                    done()
                })
        })
    })



    describe('Thumbnail', () => {
        it('return a image only after accepting the valid url', (done) => {
            request.agent(app)
                .post('/api/thumbnail')
                .set('token', token)
                .send({ url: urlValid })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200)
                    expect(res.body.conversionStatus).to.equal('successful')
                })
            done()
        })

        it('Do not return the image if token is invalid', (done) => {
            request.agent(app)
                .post('/api/thumbnail')
                .set('token', 'randomewwrongtoken')
                .send({ url: urlValid })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(401)
                    expect(res.body.authorized).to.equal(false)
                })
            done()
        })

        it('Do not return the image if url is invalid', (done) => {
            request.agent(app)
                .post('/api/thumbnail')
                .set('token', token)
                .send({ url: urlInvalid })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400)
                })
            done()
        })
    })



})
