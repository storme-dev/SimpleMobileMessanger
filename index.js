const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')

const { SimpleDB } = require('./db')

const app = express()
app.use(bodyParser.json())
const port = 3000

const db = new SimpleDB('messanger', {
    users: {
        id: 'AUTO_INCREMENT',
        login: '',
        firstname: '',
        lastname: '',
        password: ''
    },
    sessions: {
        id: 'AUTO_INCREMENT',
        userid: 0,
        hash: ''
    }
})

const static_routes = [
    {
        path: '/',
        file: 'index'
    },
    {
        path: '/login',
        file: 'sign'
    }
]

static_routes.forEach(item => {
    app.get(item.path, (req, res) => {
        res.sendFile(`${__dirname}/view/${item.file}.html`)
    })
})

// API
app.post('/auth', (req, res) => {
    
    let results = db.find('users', user => {
        if(user.login == req.body.login && user.password == req.body.pass) return true
    })

    if(results.length >= 1)
    {   
        let user = results[0]

        let hash = crypto.createHash('sha256').update(`${user.id}${user.password}${user.login}`).digest('hex')
        
        db.insert('sessions', {
            userid: user.id,
            hash
        })

        res.send({ success: 1, hash })
    }
    else
    {
        res.send({ success: 0 })
    }
})

app.post('/check_session', (req, res) => {

    let hash = req.body.hash

    let results = db.find('sessions', sesssion => {
        if(sesssion.hash == hash) return true
    })

    if(results.length > 0)
    {
        res.send({ success: 1 })
    }
    else
    {
        res.send({ success: 0 })
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
