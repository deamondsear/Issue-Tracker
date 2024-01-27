const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");


chai.use(chaiHttp);

suite("Functional Tests", function () {
  let id
  test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest/")
      .send({
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_by: "Joe",
        assigned_to: "Joe",
        status_text: "In QA",
      })
      .end((err, res) => {
        id = res.body._id
        assert.equal(res.body.issue_title, "Fix error in posting data");
        assert.equal(res.body.issue_text, "When we post data it has an error.");
        assert.equal(res.body.created_by, "Joe");
        assert.equal(res.body.assigned_to, "Joe");
        assert.equal(res.body.status_text, "In QA");
        done();
      });
  });

  test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest/")
      .send({
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_by: "Joe",
      })
      .end((err, res) => {
        assert.equal(res.body.issue_title, "Fix error in posting data");
        assert.equal(res.body.issue_text, "When we post data it has an error.");
        assert.equal(res.body.created_by, "Joe");
        done();
      });
  });

  test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest/")
      .send({
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
      })
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }
        assert.deepEqual(res.body, { error: "required field(s) missing" });
        done();
      });
  });

  test("View issues on a project: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest/")
      .end((err, res) => {
        assert.isArray(res.body);
        done();
      });
  });

  test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest/?open=true")
      .end((err, res) => {
        res.body.forEach((obj) => {
          assert.equal(obj.open, true);
        });
        done();
      });
  });

  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest/?open=true&assigned_to=Joe")
      .end((err, res) => {
        res.body.forEach((obj) => {
          assert.equal(obj.open, true);
          assert.equal(obj.assigned_to, "Joe");
        });
        done();
      });
  });

  test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest/")
      .send({ _id: id, issue_title: "Update title" })
      .end((err, res) => {
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: id,
        });
        done();
      });
  });

  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest/")
      .send({
        _id: id,
        issue_title: "Update title",
        issue_text: "Update text",
      })
      .end((err, res) => {
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: id,
        });
        done();
      });
  });

  test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest/")
      .send({ issue_title: "Update title", issue_text: "Update text" })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });

  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest/")
      .send({ _id: id })
      .end((err, res) => {
        assert.deepEqual(res.body, {
          error: "no update field(s) sent",
          _id: id,
        });
        done();
      });
  });

  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest/")
      .send({ _id: 'invalid', issue_text: "some text" })
      .end((err, res) => {
        assert.deepEqual(res.body, {
          error: "could not update",
          _id: 'invalid',
        });
        done();
      });
  });

  test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest/")
      .send({ _id: id })
      .end((err, res) => {
        assert.deepEqual(res.body, {
          result: "successfully deleted",
          _id: id,
        });
        done();
      });
  });

  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest/")
      .send({ _id: "65f7c050dcd773" })
      .end((err, res) => {
        assert.deepEqual(res.body, {
          error: "could not delete",
          _id: "65f7c050dcd773",
        });
        done();
      });
  });

  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest/")
      .send({})
      .end((err, res) => {
        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });
});
