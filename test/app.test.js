const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const request = require('supertest');
const app = require('../lib/app');

const createPerson = (name) => {
  return request(app)
    .post('/people')
    .send({
      name: name,
      age: 100,
      favoriteColor: 'red'
    })
    .then(res => res.body);
};

describe('app tests', () => {
  beforeEach(done => {
    rimraf('./data/people', err => {
      done(err);
    });
  });
  
  beforeEach(done => {
    mkdirp('./data/people', err => {
      done(err);
    });
  });

  it('creates a person', () => {
    return request(app)
      .post('/people')
      .send({
        name: 'Uncle Bob',
        age: 100,
        favoriteColor: 'red'
      })
      .then(res => {
        expect(res.body).toEqual({
          name: 'Uncle Bob',
          age: 100,
          favoriteColor: 'red',
          _id: expect.any(String)
        });
      });
  });
  
  it('gets a list of people from db', () => {
    const namesToCreate = ['mary', 'mary1', 'mary2', 'mary3'];
    return Promise.all(namesToCreate.map(createPerson))
      .then(() => {
        return request(app)
          .get('/people');
      })
      .then(({ body }) => {
        expect(body).toHaveLength(4);
      });
  }); 

  it('gets a person by id', () => {
    return createPerson('mary')
      .then(createdPerson => {
        const id = createdPerson.id;
        return request(app)
          .get(`/people/${id}`);
      })
      .then(res => {
        expect(res.body.name).toEqual(res.body._id);
      });
  });

  it('updates a person with id', () => {
    return createPerson('mary')
      .then(createdPerson => {
        const id = createdPerson._id;
        return request(app)
          .put(`/people/${id}`)
          .send({ 
            name: 'Margaret',
            age: 50,
            favoriteColor: 'blue',
          })
          .then(res => {
            expect(res.body).toEqual({ 
              name: 'Margaret',
              age: 50,
              favoriteColor: 'blue',
              _id: expect.any(String)
            });
          });
      });
  });
  it('deletes person by id', () => {
    return createPerson('mary')
      .then(createdPerson => {
        const id = createdPerson._id;
        return request(app)
          .delete(`/people/${id}`);
      })
      .then(res => {
        expect(res.body).toEqual({ deleted: 1 });
      });
  });
});

