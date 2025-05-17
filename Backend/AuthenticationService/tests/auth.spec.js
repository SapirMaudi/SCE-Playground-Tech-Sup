// tests/TechSupport.spec.js
process.env.NODE_ENV = 'test';

import { expect } from 'chai';
import chaiHttp from 'chai-http';
import chai from 'chai';
import express from 'express';
import bodyParser from 'body-parser';
import * as controller from '../src/controllers/techSupController.js';
import { initDB } from '../src/data-access/db.js';

chai.use(chaiHttp);

// יצירת אפליקציה עם ראוטים
const app = express();
app.use(bodyParser.json());
app.use('/techsupport', controller.router); // נניח שייצאת router

// הפעלת השרת בפורט זמני
let server;

before(async function () {
  this.timeout(10000);
  await initDB();
  server = app.listen(13250, () => {
    console.log('[ ✅ ] Tech-Support Service is running at port: 13250');
  });
});

after(() => {
  if (server) server.close();
});

describe('🧪 TechSupport Backend Full API Test Suite', () => {
  let ticketId;

  it('POST /techsupportadd → should create a new ticket', done => {
    chai.request(app)
      .post('/techsupportadd')
      .send({
        type: 1,
        name: 'Test User',
        email: 'test@example.com',
        category: 'Bug report',
        description: 'There is a problem',
        imgs: { img1: '', img2: '', img3: '', img4: '' }
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        ticketId = res.body.ticket.id;
        done();
      });
  });

  it('GET /techsupport → should return all tickets including the new one', done => {
    chai.request(app)
      .get('/techsupport')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('GET /techsupportfetchuserrequests → should return tickets for specific user', done => {
    chai.request(app)
      .get('/techsupportfetchuserrequests')
      .query({ email: 'test@example.com' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.userRequest).to.be.an('array');
        done();
      });
  });

  it('POST /posttechsupportforum → user sends a forum message', done => {
    chai.request(app)
      .post('/posttechsupportforum')
      .send({
        pid: ticketId,
        name: 'Test User',
        content: 'I have a problem',
        isAgent: false
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });

  it('POST /posttechsupportforum → agent sends a reply', done => {
    chai.request(app)
      .post('/posttechsupportforum')
      .send({
        pid: ticketId,
        name: 'Agent',
        content: 'We are checking',
        isAgent: true
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });

  it('GET /gettechsupportforum → should return forum messages for the ticket', done => {
    chai.request(app)
      .get('/gettechsupportforum')
      .query({ pid: ticketId })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.messages).to.be.an('array');
        done();
      });
  });

  it('PATCH /techsupportcloserequest → should close the ticket', done => {
    chai.request(app)
      .patch('/techsupportcloserequest')
      .send({ id: ticketId })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('GET /techsupportisagent → should return false for non-existing agent', done => {
    chai.request(app)
      .get('/techsupportisagent')
      .query({ email: 'unknown@example.com' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.agent).to.equal(false);
        done();
      });
  });

  it('POST /techsupportaddagent → should add a new agent', done => {
    chai.request(app)
      .post('/techsupportaddagent')
      .send({ email: 'agent@example.com' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });

  it('GET /techsupportisagent → should return true for added agent', done => {
    chai.request(app)
      .get('/techsupportisagent')
      .query({ email: 'agent@example.com' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.agent).to.equal(true);
        done();
      });
  });
});
